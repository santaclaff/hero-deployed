/*:
 * @plugindesc v2.0 Real-time playtime with safe migration for vanilla and older ChampX saves.
 * @author ChampX / HERO
 *
 * @help
 * ============================================================================
 * Real-Time Playtime
 * ============================================================================
 *
 * Counts playtime from real elapsed time rather than rendered frames.
 *
 * Existing saves are migrated once, then retain their accumulated playtime:
 *
 *   - Legacy saves use vanilla MV's _framesOnSave when available.
 *   - If that field is unavailable, older ChampX values are used as a fallback.
 *
 * Plugin Commands
 *
 *   ResetPlaytime   Resets playtime to 0.
 *   PausePlaytime   Stops playtime accumulation.
 *   ResumePlaytime  Resumes playtime accumulation.
 *
 * Enable this plugin only once in the Plugin Manager. Do not run an older
 * playtime-altering plugin alongside it.
 */

(function() {
    'use strict';

    var FORMAT_VERSION = 2;
    var sessionStartedAt = 0;
    var paused = false;

    var _DataManager_setupNewGame = DataManager.setupNewGame;
    var _GameSystem_initialize = Game_System.prototype.initialize;
    var _GameSystem_onBeforeSave = Game_System.prototype.onBeforeSave;
    var _GameSystem_onAfterLoad = Game_System.prototype.onAfterLoad;
    var _GameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

    function now() {
        return Date.now();
    }

    function isFiniteNumber(value) {
        return typeof value === 'number' && isFinite(value) && value >= 0;
    }

    function ensurePlaytime(system) {
        if (!isFiniteNumber(system._heroPlaytimeMs)) {
            system._heroPlaytimeMs = 0;
        }
    }

    function syncPlaytime(system) {
        ensurePlaytime(system);
        if (!paused && sessionStartedAt > 0) {
            system._heroPlaytimeMs += Math.max(0, now() - sessionStartedAt);
        }
        sessionStartedAt = now();
    }

    function updateLegacyFrameCount(system) {
        // Other MV plugins (including New Game+) may read this vanilla field.
        // Keep it approximately in sync without using it as the source of truth.
        system._framesOnSave = Math.floor(system._heroPlaytimeMs / 1000) * 60;
        Graphics.frameCount = system._framesOnSave;
    }

    function migratePlaytime(system) {
        if (system._heroPlaytimeFormat === FORMAT_VERSION &&
                isFiniteNumber(system._heroPlaytimeMs)) {
            return;
        }

        var milliseconds = 0;

        // Prefer MV's original value. The older plugin's _playtime field is
        // precisely what could have been reset or inflated, whereas this
        // field preserves the legacy save's displayed frame-based playtime.
        if (isFiniteNumber(system._framesOnSave) && system._framesOnSave > 0) {
            milliseconds = system._framesOnSave * 1000 / 60;

        // The immediately previous version wrote milliseconds and marked it 1.
        } else if (system._champXPlaytimeFormat === 1 &&
                isFiniteNumber(system._playtime)) {
            milliseconds = system._playtime;

        // Older unmarked ChampX saves had no marker and stored seconds.
        } else if (isFiniteNumber(system._playtime)) {
            milliseconds = system._playtime * 1000;
        }

        system._heroPlaytimeMs = Math.floor(milliseconds);
        system._heroPlaytimeFormat = FORMAT_VERSION;
    }

    Game_System.prototype.initialize = function() {
        _GameSystem_initialize.call(this);
        this._heroPlaytimeMs = 0;
        this._heroPlaytimeFormat = FORMAT_VERSION;
    };

    DataManager.setupNewGame = function() {
        _DataManager_setupNewGame.call(this);
        $gameSystem._heroPlaytimeMs = 0;
        $gameSystem._heroPlaytimeFormat = FORMAT_VERSION;
        sessionStartedAt = now();
        paused = false;
    };

    Game_System.prototype.onBeforeSave = function() {
        syncPlaytime(this);
        this._heroPlaytimeFormat = FORMAT_VERSION;
        updateLegacyFrameCount(this);
        _GameSystem_onBeforeSave.call(this);
        // The aliased vanilla method records Graphics.frameCount. Keep the
        // stored field synchronized with our real-time total instead.
        updateLegacyFrameCount(this);
    };

    Game_System.prototype.onAfterLoad = function() {
        _GameSystem_onAfterLoad.call(this);
        migratePlaytime(this);
        updateLegacyFrameCount(this);
        sessionStartedAt = now();
        paused = false;
    };

    Game_System.prototype.playtime = function() {
        ensurePlaytime(this);
        var milliseconds = this._heroPlaytimeMs;
        if (!paused && sessionStartedAt > 0) {
            milliseconds += Math.max(0, now() - sessionStartedAt);
        }
        return Math.floor(milliseconds / 1000);
    };

    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _GameInterpreter_pluginCommand.call(this, command, args);
        if (!$gameSystem) return;

        if (command === 'ResetPlaytime') {
            $gameSystem._heroPlaytimeMs = 0;
            $gameSystem._heroPlaytimeFormat = FORMAT_VERSION;
            sessionStartedAt = now();
            paused = false;
            updateLegacyFrameCount($gameSystem);
        } else if (command === 'PausePlaytime') {
            if (!paused) {
                syncPlaytime($gameSystem);
                paused = true;
            }
        } else if (command === 'ResumePlaytime') {
            if (paused) {
                sessionStartedAt = now();
                paused = false;
            }
        }
    };
})();
