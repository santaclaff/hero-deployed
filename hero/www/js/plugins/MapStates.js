/*:
 * @plugindesc v1.8 Map-based states applied in overworld + battle (no messages)
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
 * - States are removed only if they are NOT present on the new map.
 * - If both maps have the same state, it persists across transfer.
 *
 * ============================================================================
 */

(function() {

    function getMapStates() {
        var map = $dataMap;
        if (!map || !map.note) return [];
        var match = map.note.match(/<MapStates:\s*([^>]+)>/i);
        if (match) {
            return match[1].split(',').map(function(n) { return Number(n.trim()); }).filter(function(n) { return n > 0; });
        }
        return [];
    }

    function applyMapStates(states) {
        if (!states || !states.length) return;
        $gameParty.members().forEach(function(actor) {
            states.forEach(function(stateId) {
                actor.addState(stateId);
            });
        });
        if ($gameParty.inBattle()) {
            $gameTroop.members().forEach(function(enemy) {
                states.forEach(function(stateId) {
                    enemy.addState(stateId);
                });
            });
        }
    }

    // ------------------------------------------------------------
    // Map setup – remove only states not present on the new map
    // ------------------------------------------------------------
    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        var currentMapId = this._mapId;
        var newStates = getMapStates();

        if (this._mapStatesApplied && currentMapId !== mapId) {
            // Remove only states that are NOT in the new map's list
            var removeStates = this._mapStatesApplied.filter(function(id) {
                return newStates.indexOf(id) === -1;
            });
            if (removeStates.length) {
                $gameParty.members().forEach(function(actor) {
                    removeStates.forEach(function(stateId) {
                        actor.removeState(stateId);
                    });
                }, this);
            }
            this._mapStatesApplied = null;
        }

        _Game_Map_setup.call(this, mapId);

        this._mapStatesApplied = newStates;
        if (newStates.length) {
            applyMapStates(newStates);
        }
    };

    // ------------------------------------------------------------
    // Apply to enemies at battle start
    // ------------------------------------------------------------
    var _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        _BattleManager_startBattle.call(this);
        var states = getMapStates();
        if (states.length) applyMapStates(states);
    };

    // ------------------------------------------------------------
    // Reapply on scene start (after menu, battle, etc.)
    // ------------------------------------------------------------
    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        var states = $gameMap._mapStatesApplied || getMapStates();
        if (states.length) {
            $gameMap._mapStatesApplied = states;
            applyMapStates(states);
        }
    };

})();