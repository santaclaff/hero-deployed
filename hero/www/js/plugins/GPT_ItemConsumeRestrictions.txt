/*:
 * @plugindesc Restrict item targets to specific actors.
 * @author You
 *
 * @help
 *
 * Item Notetag:
 *
 * <Target Actor: 1>
 *
 * or
 *
 * <Target Actors: 1,2,3>
 *
 */

(function() {

function allowedTargetActors(item) {
    if (!item) return null;

    let match = item.note.match(/<Target Actors?:\s*([0-9,\s]+)>/i);
    if (!match) return null;

    return match[1]
        .split(',')
        .map(n => Number(n.trim()))
        .filter(n => n > 0);
}

const _isEnabled = Window_MenuActor.prototype.isCurrentItemEnabled;

Window_MenuActor.prototype.isCurrentItemEnabled = function() {

    const item = SceneManager._scene._itemWindow.item();

    const allowed = allowedTargetActors(item);

    if (allowed) {
        const actor = $gameParty.members()[this.index()];

        if (!actor || !allowed.includes(actor.actorId())) {
            return false;
        }
    }

    return _isEnabled.call(this);
};

const _testApply = Game_Action.prototype.testApply;

Game_Action.prototype.testApply = function(target) {

    const item = this.item();

    const allowed = allowedTargetActors(item);

    if (allowed && target.isActor()) {
        if (!allowed.includes(target.actorId())) {
            return false;
        }
    }

    return _testApply.call(this, target);
};

})();