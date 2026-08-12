//=============================================================================
// HERO_ShopMultiSlotCompare.js
//=============================================================================

var Imported = Imported || {};
Imported.HERO_ShopMultiSlotCompare = true;

var HERO = HERO || {};
HERO.ShopMultiSlotCompare = HERO.ShopMultiSlotCompare || {};

/*:
 * @plugindesc v1.00 Shows a stat-change range in YEP Shop Menu Core when
 * an equipment type has multiple compatible slots.
 * @author HERO
 *
 * @help
 * ============================================================================
 * HERO - Shop Multi-Slot Compare
 * ============================================================================
 *
 * Requires:
 *   YEP_EquipCore
 *   YEP_ShopMenuCore
 *
 * Place this plugin BELOW both.
 *
 * When an actor has multiple slots of the same equipment type, Shop Menu
 * Core normally compares a shop item against only one currently equipped
 * item.
 *
 * This plugin instead compares the shop item against every compatible slot.
 *
 * Example:
 *
 *   New Accessory: +5 ATK
 *
 *   Accessory 1: +6 ATK -> -1
 *   Accessory 2: +2 ATK -> +3
 *   Accessory 3: +4 ATK -> +1
 *
 *   Display:
 *     -1~+3
 *
 * Empty slots are included in the comparison.
 *
 * If every compatible slot produces the same change, only one value is
 * displayed:
 *
 *     +3
 *
 * Color:
 *   Entire range positive -> positive parameter color
 *   Entire range negative -> negative parameter color
 *   Range crosses zero    -> normal text color
 *   Zero only             -> dimmed
 *
 * ============================================================================
 */


//=============================================================================
// Window_ShopStatus
//=============================================================================

/**
 * Returns all currently equipped items occupying slots compatible with the
 * shop item.
 *
 * Empty slots are returned as null.
 */
Window_ShopStatus.prototype.heroCompatibleEquips = function(actor, item) {
    if (!actor || !item) return [];

    var slots = actor.equipSlots();
    var equips = actor.equips();
    var result = [];

    for (var i = 0; i < slots.length; ++i) {
        if (slots[i] === item.etypeId) {
            result.push(equips[i] || null);
        }
    }

    return result;
};


/**
 * Gets the minimum and maximum possible parameter change produced by
 * equipping the shop item into any compatible slot.
 */
Window_ShopStatus.prototype.heroParamChangeRange = function(actor, item, paramId) {
    var equips = this.heroCompatibleEquips(actor, item);

    // ------------------------------------------------------------
    // TWO-HANDED WEAPON SUPPORT
    // ------------------------------------------------------------
    if (DataManager.isWeapon(item) &&
        Imported.YEP_EquipCore &&
        item.twoHanded !== undefined) {

        var actorEquips = actor.equips();
        var slots = actor.equipSlots();

        // --------------------------------------------------------
        // New weapon is TWO-HANDED.
        //
        // TwoHanded.js removes the weapon in the other weapon
        // slot, so calculate the loss of ALL currently equipped
        // weapons in weapon slots 0 and 1.
        // --------------------------------------------------------
        if (item.twoHanded) {
            var oldValue = 0;

            for (var i = 0; i < slots.length; ++i) {
                if (slots[i] !== item.etypeId) continue;

                var oldItem = actorEquips[i];

                if (oldItem && DataManager.isWeapon(oldItem)) {
                    oldValue += oldItem.params[paramId];
                }
            }

            var change = item.params[paramId] - oldValue;

            return {
                min: change,
                max: change
            };
        }

        // --------------------------------------------------------
        // New weapon is ONE-HANDED.
        //
        // If a two-handed weapon is currently equipped,
        // TwoHanded.js removes it before equipping this weapon.
        //
        // Therefore compare against the two-handed weapon itself,
        // rather than treating the empty second slot as an
        // independent option.
        // --------------------------------------------------------
        var twoHandedItem = null;

        for (var i = 0; i < actorEquips.length; ++i) {
            var oldItem = actorEquips[i];

            if (oldItem &&
                DataManager.isWeapon(oldItem) &&
                oldItem.twoHanded) {

                twoHandedItem = oldItem;
                break;
            }
        }

        if (twoHandedItem) {
            var change =
                item.params[paramId] -
                twoHandedItem.params[paramId];

            return {
                min: change,
                max: change
            };
        }
    }


    // ------------------------------------------------------------
    // NORMAL MULTI-SLOT BEHAVIOR
    // ------------------------------------------------------------
    //
    // Accessories, normal weapons, or any other duplicated
    // equipment type.
    // ------------------------------------------------------------

    if (equips.length <= 0) {
        var value = item.params[paramId];

        return {
            min: value,
            max: value
        };
    }

    var min = Infinity;
    var max = -Infinity;

    for (var i = 0; i < equips.length; ++i) {
        var oldItem = equips[i];

        var oldValue = oldItem ? oldItem.params[paramId] : 0;
        var change = item.params[paramId] - oldValue;

        min = Math.min(min, change);
        max = Math.max(max, change);
    }

    return {
        min: min,
        max: max
    };
};


/**
 * Adds a + sign to positive values and applies Yanfly's number grouping.
 */
Window_ShopStatus.prototype.heroFormatParamChange = function(value) {
    var text = Yanfly.Util.toGroup(value);

    if (value > 0) {
        text = '+' + text;
    }

    return text;
};


/**
 * Turns a range into:
 *
 *   +3
 *   -2~+5
 *   -4~-1
 */
Window_ShopStatus.prototype.heroFormatParamRange = function(range) {
    if (range.min === range.max) {
        return this.heroFormatParamChange(range.min);
    }

    return this.heroFormatParamChange(range.min) +
           '~' +
           this.heroFormatParamChange(range.max);
};


/**
 * Chooses the color for a range.
 *
 * Entirely positive = positive color.
 * Entirely negative = negative color.
 * Mixed = normal color.
 */
Window_ShopStatus.prototype.heroSetRangeColor = function(range) {
    if (range.min > 0) {
        this.changeTextColor(this.paramchangeTextColor(1));
    } else if (range.max < 0) {
        this.changeTextColor(this.paramchangeTextColor(-1));
    } else {
        this.resetTextColor();
    }
};


//=============================================================================
// Actor Mode
//=============================================================================
//
// Replaces the individual stat comparison:
//
//     ATK       +3
//
// with:
//
//     ATK    -1~+3
//
// when multiple compatible slots exist.
//=============================================================================

Window_ShopStatus.prototype.drawActorChange = function(actor, rect, item1, i) {
    var range = this.heroParamChangeRange(actor, this._item, i);

    var isZero = range.min === 0 && range.max === 0;
    this.changePaintOpacity(!isZero);

    this.heroSetRangeColor(range);

    var text = this.heroFormatParamRange(range);

    this.drawText(
        text,
        rect.x,
        rect.y,
        rect.width,
        'right'
    );
};


//=============================================================================
// Default Mode
//=============================================================================
//
// Replaces the one-stat-per-actor comparison with the same range logic.
//=============================================================================

Window_ShopStatus.prototype.drawActorParamChange = function(x, y, actor, item1) {
    var width = this.contents.width - this.textPadding() - x;
    var paramId = this.paramId();

    var range = this.heroParamChangeRange(actor, this._item, paramId);

    var isZero = range.min === 0 && range.max === 0;
    this.changePaintOpacity(!isZero);

    this.heroSetRangeColor(range);

    var text = this.heroFormatParamRange(range);

    this.drawText(
        text,
        x,
        y,
        width,
        'right'
    );

    this.changePaintOpacity(true);
};


//=============================================================================
// End of File
//=============================================================================