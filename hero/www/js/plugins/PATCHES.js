/*:
 * @plugindesc Fixes missing _summons array for old saves.
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

// Place this after all plugins
var _Scene_Name_start = Scene_Name.prototype.start;
Scene_Name.prototype.start = function() {
    _Scene_Name_start.call(this);
    if (SRD.NameInput.keyboardMode) {
        this.setLetters();
        Input.resetAllKeystrokes();
    }
};