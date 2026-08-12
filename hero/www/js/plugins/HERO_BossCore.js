/*:
 * @plugindesc [HERO] Core boss functionality. Adds <Boss> enemies and restriction immunity.
 * @author HERO
 *
 * @help
 * ============================================================================
 * Boss Notetag
 * ============================================================================
 *
 * Enemy Notetag:
 *
 *   <Boss>
 *
 * Marks an enemy as a boss.
 *
 * Bosses are immune to states with an RPG Maker MV restriction:
 *
 *   - Attack an Enemy
 *   - Attack Anyone
 *   - Attack an Ally
 *   - Cannot Move
 *
 * States without restrictions still work normally.
 *
 * This includes DoTs, debuffs, buffs, elemental effects, etc.
 *
 * Other plugins can check:
 *
 *   battler.isBoss()
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.HERO_BossCore = true;

var HERO = HERO || {};
HERO.BossCore = HERO.BossCore || {};

(function() {

    //=========================================================================
    // Game_BattlerBase
    //=========================================================================

    // Actors and ordinary battlers are never bosses by default.
    Game_BattlerBase.prototype.isBoss = function() {
        return false;
    };


    //=========================================================================
    // Game_Enemy
    //=========================================================================

    Game_Enemy.prototype.isBoss = function() {
        return !!this.enemy().meta.Boss;
    };


    //=========================================================================
    // State Restriction Immunity
    //=========================================================================

    var _HERO_BossCore_isStateResist =
        Game_BattlerBase.prototype.isStateResist;

    Game_BattlerBase.prototype.isStateResist = function(stateId) {

        // Boss-specific immunity.
        if (this.isBoss && this.isBoss()) {

            var state = $dataStates[stateId];

            // restriction:
            // 0 = None
            // 1 = Attack an Enemy
            // 2 = Attack Anyone
            // 3 = Attack an Ally
            // 4 = Cannot Move
            if (stateId != 1 && state && state.restriction > 0) {
                return true;
            }
        }

        return _HERO_BossCore_isStateResist.call(this, stateId);
    };

    //=============================================================================
    // Boss Collapse Effect
    //=============================================================================

    var _HERO_BossCore_collapseType =
        Game_Enemy.prototype.collapseType;

    Game_Enemy.prototype.collapseType = function() {

        // Bosses automatically use RPG Maker MV's built-in
        // Boss Collapse effect.
        if (this.isBoss()) {
            return 1;
        }

        return _HERO_BossCore_collapseType.call(this);
    };

})();