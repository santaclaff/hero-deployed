/*:
 * @target MV
 * @plugindesc v1.8 Autosave System for RPG Maker MV. Dedicated slot shows as "Autosave" with playtime and optional manual save.
 * @author Sphinx
 *
 * @param Autosave Slot
 * @type number
 * @min 1
 * @desc The save slot used for autosave (e.g., 1 = first slot)
 * @default 1
 *
 * @param Allow Manual Save
 * @type boolean
 * @on Allow
 * @off Disallow
 * @desc Whether the player can manually save on the autosave slot
 * @default false
 *
 * @param Autosave After Battle
 * @type boolean
 * @on Enabled
 * @off Disabled
 * @desc Automatically save after each battle ends
 * @default true
 *
 * @param Autosave After Transfer
 * @type boolean
 * @on Enabled
 * @off Disabled
 * @desc Automatically save after transferring to another map
 * @default true
 *
 * @help
 * =======================================
 * Sphinx Autosave+
 * =======================================
 *
 * Features:
 * - Dedicated autosave slot (default: slot 1)
 * - Slot displays as "Autosave" in menus
 * - Shows playtime in the menu
 * - Optional manual save restriction
 * - Optional autosave after battle
 * - Optional autosave after map transfer
 *
 * Plugin Commands:
 *   Autosave       # Save immediately to the autosave slot
 *
 * Script Call:
 *   $gameSystem.autosave();
 */

(function() {
    const params = PluginManager.parameters('Sphinx_savesPLUS');
    const AUTOSAVE_SLOT = Number(params['Autosave Slot'] || 1);
    const ALLOW_MANUAL = params['Allow Manual Save'] === 'true';
    const AUTOSAVE_BATTLE = params['Autosave After Battle'] === 'true';
    const AUTOSAVE_TRANSFER = params['Autosave After Transfer'] === 'true';

    // --- Plugin Command ---
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command.toLowerCase() === 'autosave') {
            $gameSystem.autosave();
        }
    };

    // --- Autosave Core ---
    Game_System.prototype.autosave = function() {
        DataManager.saveGame(AUTOSAVE_SLOT);
        console.log(`Autosaved to slot ${AUTOSAVE_SLOT}`);
    };

    // --- Rename autosave slot in save/load menus ---
    const _Window_SavefileList_drawItem = Window_SavefileList.prototype.drawItem;
    Window_SavefileList.prototype.drawItem = function(index) {
        const savefileId = index + 1;
        const rect = this.itemRectForText(index);

        if (savefileId === AUTOSAVE_SLOT) {
            this.changeTextColor(this.textColor(6));
            const info = DataManager.loadSavefileInfo(savefileId);
            const playtime = info ? info.playtime : "0:00";
            this.drawText(`Autosave  ${playtime}`, rect.x, rect.y, rect.width);
            this.resetTextColor();
        } else {
            _Window_SavefileList_drawItem.call(this, index);
        }
    };

    // --- Disable manual save on autosave slot if disallowed ---
    const _Window_SavefileList_isEnabled = Window_SavefileList.prototype.isEnabled;
    Window_SavefileList.prototype.isEnabled = function(savefileId) {
        if (savefileId === AUTOSAVE_SLOT && !ALLOW_MANUAL) return false;
        return _Window_SavefileList_isEnabled.call(this, savefileId);
    };

    // --- Prevent deleting autosave slot ---
    const _Scene_File_commandDelete = Scene_File.prototype.commandDelete;
    Scene_File.prototype.commandDelete = function() {
        const index = this._listWindow.index();
        const savefileId = index + 1;
        if (savefileId === AUTOSAVE_SLOT) {
            SoundManager.playBuzzer();
            return;
        }
        _Scene_File_commandDelete.call(this);
    };

    // --- Autosave after battle ---
    if (AUTOSAVE_BATTLE) {
        const _BattleManager_endBattle = BattleManager.endBattle;
        BattleManager.endBattle = function(result) {
            _BattleManager_endBattle.call(this, result);
            $gameSystem.autosave();
        };
    }

    // --- Autosave after map transfer ---
    if (AUTOSAVE_TRANSFER) {
        const _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
        Game_Player.prototype.performTransfer = function() {
            const wasTransferring = this.isTransferring();
            _Game_Player_performTransfer.call(this);
            if (wasTransferring) $gameSystem.autosave();
        };
    }

    // --- Prevent crash on empty BGM ---
    const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function() {
        if (this._lastBgm && this._lastBgm.name) {
            _Game_System_onAfterLoad.call(this);
        } else {
            this._lastBgm = { name: '', volume: 0, pitch: 100, pan: 0 };
        }
    };

})();
