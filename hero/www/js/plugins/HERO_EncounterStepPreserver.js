/*:
 * @plugindesc Preserves random encounter step count across same-map transfers and vehicle changes.
 * @author HERO
 *
 * @help
 * Normally, certain actions can reset/reroll the player's remaining
 * encounter steps. This plugin prevents that from happening when:
 *
 * - Transferring to another position on the SAME map
 * - Getting on a vehicle
 * - Getting off a vehicle
 *
 * Transfers to a DIFFERENT map still reset encounter steps normally.
 *
 * No plugin commands or parameters.
 */

(function() {

    // ------------------------------------------------------------
    // SAME-MAP TRANSFERS
    // ------------------------------------------------------------

    var _Game_Player_performTransfer = Game_Player.prototype.performTransfer;

    Game_Player.prototype.performTransfer = function() {
        if (this.isTransferring()) {
            var oldMapId = $gameMap.mapId();
            var newMapId = this._newMapId;
            var encounterCount = this._encounterCount;

            _Game_Player_performTransfer.call(this);

            // Restore encounter progress if we stayed on the same map.
            if (oldMapId === newMapId) {
                this._encounterCount = encounterCount;
            }
        } else {
            _Game_Player_performTransfer.call(this);
        }
    };


    // ------------------------------------------------------------
    // VEHICLE CHANGES
    // ------------------------------------------------------------

    var _Game_Player_getOnVehicle = Game_Player.prototype.getOnVehicle;

    Game_Player.prototype.getOnVehicle = function() {
        var encounterCount = this._encounterCount;
        var result = _Game_Player_getOnVehicle.call(this);

        if (result) {
            this._encounterCount = encounterCount;
        }

        return result;
    };


    var _Game_Player_getOffVehicle = Game_Player.prototype.getOffVehicle;

    Game_Player.prototype.getOffVehicle = function() {
        var encounterCount = this._encounterCount;
        var result = _Game_Player_getOffVehicle.call(this);

        if (result) {
            this._encounterCount = encounterCount;
        }

        return result;
    };

})();