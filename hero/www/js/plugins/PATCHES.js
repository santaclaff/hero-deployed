/*:
 * @plugindesc Patches a lot of pain points. Also crit damage is now x2.
 * @author You
 */

var Patches = Patches || {};

(function() {

const _battleMembers = Game_Party.prototype.battleMembers;

Game_Party.prototype.battleMembers = function() {
    if (!this._summons) this._summons = [];
    this._summons = this._summons.filter(s => s);
    return _battleMembers.call(this);
};

Patches.refreshInactiveActors = function() {
    for (let i = 2; i < $dataActors.length; i++) {
        const actor = $gameActors.actor(i);
        if (!$gameParty.members().includes(actor)) {
            $gameActors._data[i] = new Game_Actor(i);
        }
    }
};

})();

//=============================================================================
// Patch: Rarity colors in Synthesis list (even for unsynthesized items)
//=============================================================================

(function() {

    // Copy the rarity → color index mapping from Rarity.js
    function rarityColorIndex(rarity) {
        switch(rarity) {
            case 1: return 25;   // F - brown
            case 2: return 3;    // E - light green
            case 3: return 24;   // D - green
            case 4: return 1;    // C - blue
            case 5: return 30;   // B - purple
            case 6: return 20;   // A - orange
            case 7: return 14;   // S - gold
            default: return 0;   // no rarity
        }
    }

    var _drawItemName = Window_SynthesisList.prototype.drawItemName;
    Window_SynthesisList.prototype.drawItemName = function(item, x, y, width) {
        if (!item) return;

        // If already synthesized, use the base method (which already applies rarity)
        if ($gameSystem.hasSynthed(item)) {
            Window_Base.prototype.drawItemName.call(this, item, x, y, width);
            return;
        }

        // Not synthesized: draw manually but with rarity color
        var iconBoxWidth = Window_Base._iconWidth + 4;

        // Set text color based on rarity
        var rarity = item.meta && item.meta.itemRarity ? Number(item.meta.itemRarity) : 0;
        if (rarity > 0) {
            this.changeTextColor(this.textColor(rarityColorIndex(rarity)));
        } else {
            this.resetTextColor();
        }

        this.drawIcon(item.iconIndex, x + 2, y + 2);

        var text = item.name;
        if (eval(Yanfly.Param.ISMaskUnknown)) {
            this.contents.fontItalic = Yanfly.Param.ISMaskItalic;
            if (item.maskName !== '') {
                text = item.maskName;
            } else {
                text = Yanfly.Util.maskString(text, Yanfly.Param.ISMaskText);
            }
        }

        this.drawText(text, x + iconBoxWidth, y, width - iconBoxWidth);
        this.contents.fontItalic = false;
        this.resetTextColor(); // restore default
    };

})();

//=============================================================================
// HERO - Automatic Equipment Slot Migration
//=============================================================================
//
// Repairs equipment when loading saves after equipment slots have been
// added, removed, or reordered.
//
// No old slot layout needs to be known.
//
// Examples:
//
// OLD:
//   Weapon, Weapon, Title, Armor, Accessory
//
// NEW:
//   Weapon, Weapon, Prefix, Title, Armor, Accessory
//
// Or:
//
// OLD:
//   Weapon, Title, Armor, Accessory, Accessory, Accessory
//
// NEW:
//   Prefix, Weapon, Armor, Title, Accessory
//
// Equipped items are redistributed according to their actual etypeId.
// Items for which no slot remains are returned to the party inventory.
//
//=============================================================================

(function() {

    var _DataManager_extractSaveContents =
        DataManager.extractSaveContents;

    DataManager.extractSaveContents = function(contents) {

        // Load the save normally first.
        _DataManager_extractSaveContents.call(this, contents);

        // Then repair every instantiated actor.
        for (var i = 1; i < $gameActors._data.length; i++) {

            var actor = $gameActors._data[i];

            if (!actor || !actor._equips) continue;

            HERO_rebuildActorEquips(actor);
        }
    };


    function HERO_rebuildActorEquips(actor) {

        // -------------------------------------------------------------
        // 1. Grab the equipment objects exactly as they currently exist
        //    in the save.
        // -------------------------------------------------------------

        var oldEquips = actor._equips.slice();

        var items = [];

        for (var i = 0; i < oldEquips.length; i++) {

            var gameItem = oldEquips[i];

            if (!gameItem) continue;

            var item = gameItem.object();

            if (item) {
                items.push(item);
            }
        }


        // -------------------------------------------------------------
        // 2. Get the CURRENT equipment layout from Equip Core.
        // -------------------------------------------------------------

        var slots = actor.equipSlots();


        // -------------------------------------------------------------
        // 3. Build an entirely fresh equipment array matching the
        //    current slot layout.
        // -------------------------------------------------------------

        var newEquips = [];

        for (var i = 0; i < slots.length; i++) {
            newEquips[i] = new Game_Item();
        }


        // -------------------------------------------------------------
        // 4. Redistribute every saved equipment item.
        //
        //    The item's etypeId determines where it belongs.
        // -------------------------------------------------------------

        for (var i = 0; i < items.length; i++) {

            var item = items[i];
            var placed = false;

            for (var slotId = 0; slotId < slots.length; slotId++) {

                // This slot isn't the right equipment type.
                if (slots[slotId] !== item.etypeId) continue;

                // Already occupied.
                if (newEquips[slotId].object()) continue;

                newEquips[slotId].setObject(item);
                placed = true;
                break;
            }


            // ---------------------------------------------------------
            // No compatible slot remains.
            //
            // Example:
            //
            // OLD: 3 Accessory slots
            // NEW: 2 Accessory slots
            //
            // The third accessory goes back into inventory.
            // ---------------------------------------------------------

            if (!placed) {
                $gameParty.gainItem(item, 1);
            }
        }


        // -------------------------------------------------------------
        // 5. Replace the malformed old equipment layout.
        // -------------------------------------------------------------

        actor._equips = newEquips;

        actor.refresh();
    }

})();

// Place this after all plugins
var _Scene_Name_start = Scene_Name.prototype.start;
Scene_Name.prototype.start = function() {
    _Scene_Name_start.call(this);
    if (SRD.NameInput.keyboardMode) {
        this.setLetters();
        Input.resetAllKeystrokes();
    }
};

//=============================================================================
// HERO_StopEventOnFatalBattleDefeat.js
//=============================================================================

var Imported = Imported || {};
Imported.HERO_StopEventOnFatalBattleDefeat = true;

(function() {

    var _command301 = Game_Interpreter.prototype.command301;

    Game_Interpreter.prototype.command301 = function() {

        // Remember whether THIS Battle Processing allows losing.
        var canLose = this._params[3];

        var result = _command301.call(this);

        if (BattleManager._eventCallback) {

            var oldCallback = BattleManager._eventCallback;
            var interpreter = this;

            BattleManager._eventCallback = function(battleResult) {

                oldCallback(battleResult);

                // 2 = defeat.
                //
                // Only terminate the event when Can Lose was NOT checked.
                // Can-Lose battles retain their normal event behavior.
                if (battleResult === 2 && !canLose) {
                    interpreter._index = interpreter._list.length;
                }
            };
        }

        return result;
    };

})();

Game_Action.prototype.applyCritical = function(damage) {
    return damage * 2;
};

/* ============================================================================
 * HERO Patch - Battle AI EVA / MEV Conditions
 * 
 * Allows:
 * EVA param < 20%
 * MEV param < 20%
 * ========================================================================== */

(function() {

    var _HERO_passAIConditions = AIManager.passAIConditions;

    AIManager.passAIConditions = function(line) {

        // EVA PARAM
        if (line.match(/EVA[ ]PARAM[ ](.*)/i)) {
            return this.HERO_conditionXParam(1, String(RegExp.$1));
        }

        // MEV PARAM
        if (line.match(/MEV[ ]PARAM[ ](.*)/i)) {
            return this.HERO_conditionXParam(4, String(RegExp.$1));
        }

        return _HERO_passAIConditions.call(this, line);
    };


    AIManager.HERO_conditionXParam = function(xparamId, condition) {

        var group = this.getActionGroup();
        var validTargets = [];

        // Convert things like 20% into 0.20
        condition = condition.replace(/(\d+)([%％])/g, function(match, number) {
            return String(Number(number) * 0.01);
        });

        for (var i = 0; i < group.length; ++i) {

            var target = group[i];
            if (!target) continue;

            var value = target.xparam(xparamId);

            try {
                if (eval("value " + condition)) {
                    validTargets.push(target);
                }
            } catch (e) {
                Yanfly.Util.displayError(
                    e,
                    condition,
                    "HERO A.I. XPARAM ERROR"
                );
            }
        }

        if (validTargets.length <= 0) return false;

        this.setProperTarget(validTargets);
        return true;
    };

})();