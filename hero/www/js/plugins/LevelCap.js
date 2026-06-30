/*:
 * @plugindesc Customizable Level Cap Plugin with Plugin Command Support
 * @author ChatGPT
 *
 * @param Level Cap Variable ID
 * @desc ID of the game variable that controls the maximum level cap for actors.
 * @type variable
 * @default 1
 *
 * @help
 * This plugin allows you to set a custom level cap for actors in RPG Maker MV,
 * controlled by a game variable. You can also change the level cap dynamically 
 * using a plugin command.
 *
 * Plugin Command:
 *   SetLevelCap [cap]   - Sets the level cap to the specified value.
 *
 * Example:
 *   SetLevelCap 50      - Sets the level cap to 50.
 *
 * Ensure the variable set in "Level Cap Variable ID" holds a positive integer 
 * to avoid unexpected behavior.
 */

(function() {
    var parameters = PluginManager.parameters('CustomizableLevelCap');
    var levelCapVariableId = Number(parameters['Level Cap Variable ID'] || 1);

    // Plugin command to set level cap
    PluginManager.registerCommand('CustomizableLevelCap', 'SetLevelCap', args => {
        const cap = Number(args[0]);
        if (cap > 0) {
            $gameVariables.setValue(levelCapVariableId, cap);
        }
    });

    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        if (command === 'SetLevelCap') {
            const cap = Number(args[0]);
            if (cap > 0) {
                $gameVariables.setValue(levelCapVariableId, cap);
            }
        }
    };

    // Override maxLevel method to return the level cap from the variable
    Game_Actor.prototype.maxLevel = function() {
        const cap = $gameVariables.value(levelCapVariableId);
        return cap > 0 ? cap : 1;
    };

    // Override changeExp to enforce variable-based level cap
    Game_Actor.prototype.changeExp = function(exp, show) {
        this._exp[this._classId] = Math.max(exp, 0);

        if (this.isMaxLevel()) {
            this._exp[this._classId] = this.expForLevel(this._level);
        }

        const lastLevel = this._level;
        const lastSkills = this.skills();

        while (this.currentExp() >= this.nextLevelExp() && !this.isMaxLevel()) {
            this.levelUp();
        }

        while (this.currentExp() < this.currentLevelExp()) {
            this.levelDown();
        }

        if (show && this._level > lastLevel) {
            this.displayLevelUp(this.findNewSkills(lastSkills));
        }

        this.refresh();
    };

})();
