/*:
 * @plugindesc Simple Autosave
 *
 * @param Debug
 * @type boolean
 * @default false
 *
 * @param Cooldown
 * @type number
 * @default 30
 */

var Imported = Imported || {};
Imported.SimpleAutosave = true;

var AutoSave = AutoSave || {};

(function() {

const params = PluginManager.parameters("SimpleAutosave");

AutoSave.DEBUG = params["Debug"] === "true";
AutoSave.COOLDOWN = Number(params["Cooldown"] || 30);

AutoSave._pending = false;
AutoSave._reason = "";
AutoSave._cooldown = 0;
AutoSave._canAutosave = false;
AutoSave._loadedSlot = null;

AutoSave.log = function() {
    if (this.DEBUG) console.log.apply(console, arguments);
};

AutoSave.currentSlot = function() {
    return this._loadedSlot;
};

AutoSave.request = function(reason) {
    if (this._pending) {
        this.log("[AutoSave] Already pending.");
        return;
    }

    if (this._cooldown > 0) {
        this.log("[AutoSave] Cooldown.");
        return;
    }

    this._pending = true;
    this._reason = reason || "Unknown";

    this.log("[AutoSave] Requested:", this._reason);
};

AutoSave.save = function() {
    if (!$gameSystem.isSaveEnabled()) {
        this.log("[AutoSave] Save disabled.");
        return;
    }

    if (!AutoSave._canAutosave) {
        this.log("[AutoSave] Waiting for first manual save.");
        return;
    }

    const slot = this.currentSlot();

    if (slot === null) {
        this.log("[AutoSave] No save slot.");
        return;
    }

    this.log("========================");
    this.log("Reason:", this._reason);
    this.log("Scene:", SceneManager._scene.constructor.name);
    this.log("Map:", $gameMap.mapId());
    this.log("Slot:", slot);
    this.log(AudioManager.saveBgm());

    if (DataManager.saveGame(slot)) {
        this.log("[AutoSave] Success");

        this._cooldown = this.COOLDOWN;

        if (SceneManager._scene.startPopup)
            SceneManager._scene.startPopup("Autosaved");
    } else {
        this.log("[AutoSave] Failed");
    }

    this.log("========================");
};

///////////////////////////////////////////////////////////////////////////
// Config manager
///////////////////////////////////////////////////////////////////////////

ConfigManager.autosaveMap =
    ConfigManager.autosaveMap !== undefined
        ? ConfigManager.autosaveMap
        : true;

ConfigManager.autosaveBattle =
    ConfigManager.autosaveBattle !== undefined
        ? ConfigManager.autosaveBattle
        : true;

///////////////////////////////////////////////////////////////////////////
// Enable autosave
///////////////////////////////////////////////////////////////////////////

// New Game -> autosave disabled
const _DataManager_setupNewGame = DataManager.setupNewGame;

DataManager.setupNewGame = function() {
    _DataManager_setupNewGame.call(this);

    AutoSave._canAutosave = false;
    AutoSave._loadedSlot = null;
};

// Manual Save -> autosave enabled
const _Scene_Save_onSaveSuccess = Scene_Save.prototype.onSaveSuccess;

Scene_Save.prototype.onSaveSuccess = function() {
    if (AutoSave._loadedSlot === null) {
        AutoSave._loadedSlot = DataManager._lastAccessedId;
    }

    AutoSave._canAutosave = true;

    _Scene_Save_onSaveSuccess.call(this);
};

// Load Game -> autosave enabled
const _Scene_Load_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;

Scene_Load.prototype.onLoadSuccess = function() {
    AutoSave._canAutosave = true;
    _Scene_Load_onLoadSuccess.call(this);
};

const _DataManager_loadGame = DataManager.loadGame;
DataManager.loadGame = function(savefileId) {
    var result = _DataManager_loadGame.call(this, savefileId);

    if (result) {
        AutoSave._loadedSlot = savefileId;
    }

    return result;
};

///////////////////////////////////////////////////////////////////////////
// Popup
///////////////////////////////////////////////////////////////////////////

function SpriteAutoSavePopup() {
    this.initialize.apply(this, arguments);
}

SpriteAutoSavePopup.prototype = Object.create(Sprite.prototype);
SpriteAutoSavePopup.prototype.constructor = SpriteAutoSavePopup;

SpriteAutoSavePopup.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);

    this.bitmap = new Bitmap(220, 32);

    this.visible = false;
    this.opacity = 0;
};

SpriteAutoSavePopup.prototype.show = function(text) {
    this.bitmap.clear();

    const ctx = this.bitmap.context;

    const grad = ctx.createLinearGradient(0, 0, 220, 0);

    grad.addColorStop(0.00, "rgba(0,0,0,0.00)");
    grad.addColorStop(0.20, "rgba(0,0,0,0.80)");
    grad.addColorStop(0.80, "rgba(0,0,0,0.80)");
    grad.addColorStop(1.00, "rgba(0,0,0,0.00)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 220, 32);

    this.bitmap._setDirty();

    this.bitmap.fontSize = 22;
    this.bitmap.textColor = "#FFFFFF";
    this.bitmap.drawText(text, 10, 0, 180, 32, "center");

    this.x = 12;
    this.y = Graphics.boxHeight - 44;

    this.opacity = 0;
    this.visible = true;

    this._phase = 0;
    this._timer = 0;
};

SpriteAutoSavePopup.prototype.update = function() {
    Sprite.prototype.update.call(this);

    if (!this.visible) return;

    switch (this._phase) {
        // Fade in
        case 0:
            this.opacity += 32;

            if (this.opacity >= 255) {
                this.opacity = 255;
                this._phase = 1;
            }
            break;

        // Stay
        case 1:
            this._timer++;

            if (this._timer >= 120) {
                this._phase = 2;
            }
            break;

        // Fade out
        case 2:
            this.opacity -= 4;

            if (this.opacity <= 0) {
                this.opacity = 0;
                this.visible = false;
            }
            break;
    }
};

///////////////////////////////////////////////////////////////////////////
// Scene_Map
///////////////////////////////////////////////////////////////////////////

const _createDisplayObjects =
Scene_Map.prototype.createDisplayObjects;

Scene_Map.prototype.createDisplayObjects = function() {
    _createDisplayObjects.call(this);

    this._autosavePopup = new SpriteAutoSavePopup();

    this.addChild(this._autosavePopup);
};

Scene_Map.prototype.startPopup = function(text) {
    if (this._autosavePopup)
        this._autosavePopup.show(text);
};

const _Scene_Map_update =
Scene_Map.prototype.update;

Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);

    if (this._autosavePopup)
        this._autosavePopup.update();

    if (AutoSave._cooldown > 0)
        AutoSave._cooldown--;

    if (AutoSave._pending) {
        AutoSave._pending = false;
        AutoSave.save();
    }
};

///////////////////////////////////////////////////////////////////////////
// Battle
///////////////////////////////////////////////////////////////////////////

const _endBattle =
BattleManager.endBattle;

BattleManager.endBattle = function(result) {
    _endBattle.call(this,result);
    if (ConfigManager.autosaveBattle) AutoSave.request("Battle");
};

///////////////////////////////////////////////////////////////////////////
// Map Transfer
///////////////////////////////////////////////////////////////////////////

const _performTransfer =
Game_Player.prototype.performTransfer;

Game_Player.prototype.performTransfer = function() {
    const oldMap = $gameMap.mapId();

    _performTransfer.call(this);
    if (!ConfigManager.autosaveMap) return;

    const newMap = $gameMap.mapId();

    if (oldMap !== newMap) {
        AutoSave.log("[Transfer]",oldMap,"->",newMap);
        AutoSave.request("Transfer");
    }
};

///////////////////////////////////////////////////////////////////////////
// Public API
///////////////////////////////////////////////////////////////////////////

AutoSave.force = function() {
    AutoSave.request("Script");
};

})();