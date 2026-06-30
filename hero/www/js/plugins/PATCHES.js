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