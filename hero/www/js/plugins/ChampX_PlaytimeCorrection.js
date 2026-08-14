/*:
* @plugindesc Counts total playtime accurately regardless of framerate
* @help This plugin is plug-n-play and requires no parameters to set.
* To reset the play time, type ResetPlaytime in a plugin command window
* Version 1.3: Pause and ResumePlaytime commands added, also addressed a bug with doubling playtime
* Version 1.2: ResetPlaytime command
* Version 1.1: Addresses bug fix to saves not storing time correctly after multiple saves
*/

(function()
{
   
    var startTime = 0;
    var pausedTime = 0;
    var paused = false;
    
    var _DataManager_setupNewGame = DataManager.setupNewGame;
    var _GameSystem_initialize = Game_System.prototype.initialize;
    var _GameSystem_onBeforeSave = Game_System.prototype.onBeforeSave;
    var _GameSystem_onAfterLoad = Game_System.prototype.onAfterLoad;  
    var _GameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) 
    {
        _GameInterpreter_pluginCommand.call(this, command, args);
        if (command === 'ResetPlaytime') 
        {
            startTime = Date.now();
            $gameSystem._playtime = 0;
        }
        if (command === 'PausePlaytime')
        {
            if (paused) return;
            paused = true;
            pausedTime = Date.now() - startTime;
        }
        if (command === 'ResumePlaytime')
        {
            if (!paused) return;
            paused = false;
            startTime = Date.now() - pausedTime;
        }
    };
    DataManager.setupNewGame = function() 
    {
        _DataManager_setupNewGame.call(this);
        startTime = Date.now();
    };
    
    Game_System.prototype.initialize = function() 
    {
        _GameSystem_initialize.call(this);
        this._playtime = 0;
    };
    Game_System.prototype.onBeforeSave = function() 
    {
        _GameSystem_onBeforeSave.call(this);

        if (typeof this._playtime !== 'number' || !isFinite(this._playtime)) {
            this._playtime = 0;
        }

        if (paused) {
            this._playtime += pausedTime;
        } else {
            this._playtime += Date.now() - startTime;
        }

        startTime = Date.now();
        pausedTime = 0;
    };
    Game_System.prototype.onAfterLoad = function() 
    {
        _GameSystem_onAfterLoad.call(this);

        // Old saves don't have the real-time playtime accumulator.
        if (typeof this._playtime !== 'number' || !isFinite(this._playtime)) {
            this._playtime = this._framesOnSave
                ? (this._framesOnSave / 60) * 1000
                : 0;
        }

        startTime = Date.now();
        pausedTime = 0;
        paused = false;
    };
    Game_System.prototype.playtime = function() 
    {
        var accumulated = this._playtime;

        if (typeof accumulated !== 'number' || !isFinite(accumulated)) {
            accumulated = 0;
        }

        if (paused) {
            return Math.floor(
                (accumulated + pausedTime) / 1000
            );
        }

        return Math.floor(
            (accumulated + Date.now() - startTime) / 1000
        );
    };

})();