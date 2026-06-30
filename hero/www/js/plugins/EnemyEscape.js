/*:
 * @plugindesc Applies CTB-style escape probability checks to enemies.
 * @author You
 *
 * @param Enemy Escape Multiplier
 * @type number
 * @decimals 2
 * @default 2.0
 * @desc Multiplies enemy escape chance relative to actor escape ratio.
 */

(function() {

const params = PluginManager.parameters(
    document.currentScript.src.match(/([^\/]+)\.js$/)[1]
);

const enemyEscapeMultiplier =
    Number(params["Enemy Escape Multiplier"] || 2.0);

// ============================================================================
// Enemy Escape Probability
// ============================================================================

Game_Enemy.prototype.performEscape = function() {

    // non-CTB fallback
    if (!BattleManager.isCTB || !BattleManager.isCTB()) {
        this.hide();
        return;
    }

    // use same CTB escape ratio formula
    var ratio = BattleManager._escapeRatio || 0;

    // enemy multiplier
    ratio *= enemyEscapeMultiplier;

    // clamp just in case
    ratio = Math.max(0, Math.min(1, ratio));

    var success = Math.random() < ratio;

    if (success) {
        this.hide();
    }
};

})();