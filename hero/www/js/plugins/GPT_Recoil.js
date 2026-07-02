/*:
 * @plugindesc Simple Recoil Notetag v1.0
 * @author GPT
 *
 * @help
 * ============================================================================
 * Notetag
 * ============================================================================
 *
 * <Recoil>
 * JavaScript returning recoil damage.
 * </Recoil>
 *
 * Example:
 *
 * <Recoil>
 * Math.round(DF.physical({atk: b.def}, a, 50))
 * </Recoil>
 *
 * Available variables:
 *
 *   a = skill user
 *   b = target hit
 *   item = skill/item
 *   s = $gameSwitches._data
 *   v = $gameVariables._data
 *
 * The recoil only occurs if the action successfully hits.
 */

(function() {

function recoilCode(item) {
    if (!item || !item.note) return null;
    var match = item.note.match(/<Recoil>([\s\S]*?)<\/Recoil>/i);
    return match ? match[1].trim() : null;
}

var _Game_Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
    _Game_Action_apply.call(this, target);

    var result = target.result();
    if (!result.isHit()) return;

    var item = this.item();
    var code = recoilCode(item);
    if (!code) return;

    var a = this.subject();
    var b = target;
    var s = $gameSwitches._data;
    var v = $gameVariables._data;

    var damage = 0;

    try {
        damage = Number(eval(code)) || 0;
    } catch (e) {
        console.error("Recoil eval error:");
        console.error(e);
        return;
    }

    damage = Math.max(0, Math.round(damage));
    if (damage <= 0) return;

    a.gainHp(-damage);

    a.startDamagePopup();
    if (a.isDead()) {
        a.performCollapse();
    }
    a.refresh();
};

})();