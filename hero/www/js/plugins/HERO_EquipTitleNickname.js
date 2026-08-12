//=============================================================================
// HERO_EquipTitleNickname.js
//=============================================================================

/*:
 * @plugindesc v1.10 Uses equipped Prefix and Title items to build the actor's
 * displayed class name. Falls back to the database class name when needed.
 * @author HERO
 *
 * @param Title Equip Type ID
 * @type number
 * @min 1
 * @default 2
 * @desc The Equip Type ID used for Titles.
 *
 * @param Prefix Equip Type ID
 * @type number
 * @min 1
 * @default 7
 * @desc The Equip Type ID used for Prefixes.
 *
 * @help
 * ============================================================================
 * HERO - Equip Title + Prefix
 * ============================================================================
 *
 * Uses equipment to construct the actor's displayed class/title.
 *
 * Examples:
 *
 *   Prefix: Coastal
 *   Title:  F-Rank Adventurer
 *
 *   Display:
 *   Coastal F-Rank Adventurer
 *
 * If only a Title is equipped:
 *
 *   F-Rank Adventurer
 *
 * If only a Prefix is equipped, the Prefix is placed before the actor's
 * normal database class:
 *
 *   Coastal Warrior
 *
 * If neither is equipped, the normal database class is displayed.
 *
 * Requires an equipment system that provides actor.equipSlots(), such as
 * YEP_EquipCore.
 */

var Imported = Imported || {};
Imported.HERO_EquipTitleNickname = true;

var HERO = HERO || {};
HERO.TitleNickname = HERO.TitleNickname || {};

(function() {

    var parameters = PluginManager.parameters('HERO_EquipTitleNickname');

    HERO.TitleNickname.TitleTypeId =
        Number(parameters['Title Equip Type ID'] || 6);

    HERO.TitleNickname.PrefixTypeId =
        Number(parameters['Prefix Equip Type ID'] || 7);


    //=========================================================================
    // Helpers
    //=========================================================================

    HERO.TitleNickname.getEquipByType = function(actor, typeId) {
        var slots = actor.equipSlots();
        var equips = actor.equips();

        var slotIndex = slots.indexOf(typeId);

        if (slotIndex < 0) return null;

        return equips[slotIndex] || null;
    };


    //=========================================================================
    // Window_Base
    //=========================================================================

    var _Window_Base_drawActorClass =
        Window_Base.prototype.drawActorClass;

    Window_Base.prototype.drawActorClass = function(actor, x, y, width) {

        width = width || 168;

        var prefix = HERO.TitleNickname.getEquipByType(
            actor,
            HERO.TitleNickname.PrefixTypeId
        );

        var title = HERO.TitleNickname.getEquipByType(
            actor,
            HERO.TitleNickname.TitleTypeId
        );


        // -------------------------------------------------------------
        // Determine the main title/class text.
        // -------------------------------------------------------------

        var mainText;

        if (title) {
            mainText = title.name;
        } else {
            mainText = actor.currentClass().name;
        }


        // -------------------------------------------------------------
        // Add Prefix if one is equipped.
        // -------------------------------------------------------------

        var text = mainText;

        if (prefix) {
            text = prefix.name + ' ' + mainText;
        }


        // -------------------------------------------------------------
        // If we're doing absolutely nothing special, preserve the
        // original RPG Maker/Yanfly drawing behavior.
        // -------------------------------------------------------------

        if (!prefix && !title) {
            _Window_Base_drawActorClass.call(this, actor, x, y, width);
            return;
        }


        // -------------------------------------------------------------
        // Draw constructed title.
        // -------------------------------------------------------------

        this.resetTextColor();
        this.drawText(text, x, y, width);
    };

})();