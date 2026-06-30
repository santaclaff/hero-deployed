/*:
 * @plugindesc v1.1 Map-based states applied in overworld + battle (no messages)
 * @author You
 *
 * @help
 * ============================================================================
 * Map Notetags:
 * ============================================================================
 *
 * <MapStates: x, x, x>
 *   Applies these state IDs while the player is on the map.
 *
 * - Actors receive states immediately upon entering the map
 * - Enemies receive states at battle start (based on map)
 * - States are removed when leaving the map
 *
 * ============================================================================
 */

(function() {

    // ===============================
    // Utility: Read Map States
    // ===============================
    function getMapStates() {
        var map = $dataMap;
        if (!map || !map.note) return [];

        var match = map.note.match(/<MapStates:\s*([^>]+)>/i);
        if (match) {
            return match[1].split(',').map(function(n) {
                return Number(n.trim());
            }).filter(function(n) {
                return n > 0;
            });
        }

        return [];
    }

    // ===============================
    // Track previous map states
    // ===============================
    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {

        // Remove old map states BEFORE switching
        if (this._mapStatesApplied) {
            $gameParty.members().forEach(function(actor) {
                this._mapStatesApplied.forEach(function(stateId) {
                    actor.removeState(stateId);
                });
            }, this);
        }

        _Game_Map_setup.call(this, mapId);

        // Apply new map states AFTER switching
        var states = getMapStates();
        this._mapStatesApplied = states;

        if (states.length > 0) {
            $gameParty.members().forEach(function(actor) {
                states.forEach(function(stateId) {
                    actor.addState(stateId);
                });
            });
        }
    };

    // ===============================
    // Apply to enemies at battle start
    // ===============================
    var _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        _BattleManager_startBattle.call(this);

        var states = getMapStates();
        if (!states.length) return;

        $gameTroop.members().forEach(function(enemy) {
            states.forEach(function(stateId) {
                enemy.addState(stateId);
            });
        });
    };

var _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);

    var states = getMapStates();

    $gameMap._mapStatesApplied = states;

    $gameParty.members().forEach(function(actor) {
        states.forEach(function(stateId) {
            if (!actor.isStateAffected(stateId)) {
                actor.addState(stateId);
            }
        });
    });
};

})();