/*:
 * @plugindesc Prevents state immunity from removing already-existing states.
 * @author ChatGPT
 */

(function() {

    // Detect refresh-based cleanup
    const _refresh = Game_BattlerBase.prototype.refresh;

    Game_BattlerBase.prototype.refresh = function() {

        this._refreshingForStateResist = true;

        _refresh.call(this);

        this._refreshingForStateResist = false;
    };

    const _eraseState = Game_Battler.prototype.eraseState;

    Game_Battler.prototype.eraseState = function(stateId) {

        // ONLY block erase calls happening during refresh
        if (
            this._refreshingForStateResist &&
            this.isStateResist(stateId)
        ) {
            return;
        }

        _eraseState.call(this, stateId);
    };

})();