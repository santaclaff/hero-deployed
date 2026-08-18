/*:
 * @plugindesc Counts total playtime accurately regardless of framerate.
 * @author ChampX / HERO
 *
 * @help
 * ============================================================================
 * ChampX Playtime Correction
 * ============================================================================
 *
 * Counts playtime using real elapsed time instead of RPG Maker MV's
 * frame-based playtime counter.
 *
 * Plugin Commands:
 *
 *   ResetPlaytime
 *   - Resets the current playtime to 0.
 *
 *   PausePlaytime
 *   - Pauses playtime accumulation.
 *
 *   ResumePlaytime
 *   - Resumes playtime accumulation.
 *
 * ============================================================================
 * SAVE COMPATIBILITY
 * ============================================================================
 *
 * This version stores corrected playtime internally as MILLISECONDS.
 *
 * Saves created by older versions of the playtime system may contain
 * playtime in SECONDS. Those saves are automatically converted once when
 * loaded.
 *
 * New saves are marked so they will never be converted.
 *
 * ============================================================================
 */

(function() {

    'use strict';

    //--------------------------------------------------------------------------
    // Runtime variables
    //--------------------------------------------------------------------------

    var startTime = 0;
    var pausedTime = 0;
    var paused = false;

    //--------------------------------------------------------------------------
    // Aliases
    //--------------------------------------------------------------------------

    var _DataManager_setupNewGame =
        DataManager.setupNewGame;

    var _GameSystem_initialize =
        Game_System.prototype.initialize;

    var _GameSystem_onBeforeSave =
        Game_System.prototype.onBeforeSave;

    var _GameSystem_onAfterLoad =
        Game_System.prototype.onAfterLoad;

    var _GameInterpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;


    //--------------------------------------------------------------------------
    // Plugin Commands
    //--------------------------------------------------------------------------

    Game_Interpreter.prototype.pluginCommand =
        function(command, args)
    {
        _GameInterpreter_pluginCommand.call(this, command, args);

        if (command === 'ResetPlaytime')
        {
            startTime = Date.now();
            pausedTime = 0;
            paused = false;

            $gameSystem._playtime = 0;

            // This save now definitely uses the corrected format.
            $gameSystem._champXPlaytimeFormat = 1;
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


    //--------------------------------------------------------------------------
    // New Game
    //--------------------------------------------------------------------------

    DataManager.setupNewGame = function()
    {
        _DataManager_setupNewGame.call(this);

        startTime = Date.now();
        pausedTime = 0;
        paused = false;

        // New games use the corrected millisecond format.
        $gameSystem._champXPlaytimeFormat = 1;
    };


    //--------------------------------------------------------------------------
    // Game_System - Initialize
    //--------------------------------------------------------------------------

    Game_System.prototype.initialize = function()
    {
        _GameSystem_initialize.call(this);

        // Internal corrected playtime is stored in milliseconds.
        this._playtime = null;

        // 1 = corrected millisecond format.
        //
        // This is intentionally NOT placed on old saves. Old saves won't
        // have this property, allowing onAfterLoad() to recognize them.
        this._champXPlaytimeFormat = 1;
    };


    //--------------------------------------------------------------------------
    // Game_System - Before Save
    //--------------------------------------------------------------------------

    Game_System.prototype.onBeforeSave = function()
    {
        _GameSystem_onBeforeSave.call(this);

        var saveTime = Date.now() - startTime;

        if (this._playtime == null)
        {
            this._playtime = 0;
        }

        if (paused)
        {
            this._playtime += pausedTime;
        }
        else
        {
            this._playtime += saveTime;
        }

        // Mark this save as using the corrected format.
        this._champXPlaytimeFormat = 1;

        // Begin a fresh interval after saving.
        startTime = Date.now();
        pausedTime = 0;
    };


    //--------------------------------------------------------------------------
    // Game_System - After Load
    //--------------------------------------------------------------------------

    Game_System.prototype.onAfterLoad = function()
    {
        _GameSystem_onAfterLoad.call(this);

        //--------------------------------------------------------------------------
        // Legacy save migration
        //--------------------------------------------------------------------------
        //
        // Old saves from the previous system did not have our format marker.
        //
        // The old value is interpreted as seconds.
        //
        // Example:
        //
        //     22336 seconds
        //
        // becomes:
        //
        //     22336000 milliseconds
        //
        // After conversion the marker is saved, so this happens only once.
        //--------------------------------------------------------------------------

        if (this._champXPlaytimeFormat !== 1)
        {
            if (typeof this._playtime !== 'number')
            {
                this._playtime = 0;
            }
            else
            {
                this._playtime *= 1000;
            }

            this._champXPlaytimeFormat = 1;
        }

        // Start measuring real elapsed time from the moment the save
        // finishes loading.
        startTime = Date.now();
        pausedTime = 0;
        paused = false;
    };


    //--------------------------------------------------------------------------
    // Game_System - Playtime
    //--------------------------------------------------------------------------

    Game_System.prototype.playtime = function()
    {
        if (this._playtime == null)
        {
            this._playtime = 0;
        }

        var currentTime;

        if (paused)
        {
            currentTime = this._playtime + pausedTime;
        }
        else
        {
            currentTime =
                this._playtime +
                (Date.now() - startTime);
        }

        return Math.floor(currentTime / 1000);
    };

})();