//=============================================================================
// HERO_CategoryImmunity.js
//=============================================================================

/*:
 * @plugindesc v1.00 Makes battlers immune to YEP State Categories through notetags.
 * @author HERO
 *
 * @help
 * ============================================================================
 * Category Immunity
 * ============================================================================
 * Requires YEP_X_StateCategories.
 *
 * Put this notetag on any database object that supplies traits to a battler:
 * actors, classes, enemies, weapons, armors, and states.
 *
 *   <Category Immunity: basicdot>
 *
 * Quotes are optional, so this is equivalent:
 *
 *   <Category Immunity: 'basicdot'>
 *
 * A battler with this notetag has a 0% state rate for every state using the
 * matching YEP State Category. Category names are case-insensitive. Use one
 * notetag per category when an object grants more than one immunity.
 *
 * This changes only the chance of inflicting a state. It does not remove a
 * state that is already active.
 *
 * Place this plugin below YEP_X_StateCategories.
 * ============================================================================
 */

(function() {
    'use strict';

    var pluginName = 'HERO_CategoryImmunity';
    var dataGroups = [
        '$dataActors',
        '$dataClasses',
        '$dataEnemies',
        '$dataWeapons',
        '$dataArmors',
        '$dataStates'
    ];

    function normalizeCategory(category) {
        category = String(category || '').trim();
        if ((category[0] === '"' && category[category.length - 1] === '"') ||
            (category[0] === "'" && category[category.length - 1] === "'")) {
            category = category.slice(1, -1).trim();
        }
        return category.toUpperCase();
    }

    function processNotetags(group) {
        if (!group) return;
        for (var i = 1; i < group.length; i++) {
            var obj = group[i];
            if (!obj) continue;
            obj._heroCategoryImmunities = [];
            var lines = String(obj.note || '').split(/[\r\n]+/);
            for (var j = 0; j < lines.length; j++) {
                var match = lines[j].match(/<CATEGORY IMMUNITY:\s*(.*?)\s*>/i);
                if (match) {
                    var category = normalizeCategory(match[1]);
                    if (category && obj._heroCategoryImmunities.indexOf(category) < 0) {
                        obj._heroCategoryImmunities.push(category);
                    }
                }
            }
        }
    }

    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;
        if (!this._heroCategoryImmunityNotetagsLoaded) {
            for (var i = 0; i < dataGroups.length; i++) {
                processNotetags(window[dataGroups[i]]);
            }
            this._heroCategoryImmunityNotetagsLoaded = true;
        }
        return true;
    };

    Game_BattlerBase.prototype.isStateCategoryImmune = function(stateId) {
        var state = $dataStates[stateId];
        if (!state || !state.category) return false;

        var categories = state.category.map(normalizeCategory);
        if (categories.length === 0) return false;

        var objects = this.traitObjects();
        for (var i = 0; i < objects.length; i++) {
            var immunities = objects[i]._heroCategoryImmunities || [];
            for (var j = 0; j < immunities.length; j++) {
                if (categories.indexOf(immunities[j]) >= 0) return true;
            }
        }
        return false;
    };

    var _Game_BattlerBase_stateRate = Game_BattlerBase.prototype.stateRate;
    Game_BattlerBase.prototype.stateRate = function(stateId) {
        if (this.isStateCategoryImmune(stateId)) return 0;
        return _Game_BattlerBase_stateRate.call(this, stateId);
    };
})();
