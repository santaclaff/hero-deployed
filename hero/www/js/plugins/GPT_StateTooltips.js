/*:
 * @plugindesc v1.0 State Tooltip Hover (Battle) - Shows state descriptions when hovering actor state icons.
 * @author GPT
 *
 * @help
 * ============================================================================
 * Usage
 * ============================================================================
 *
 * Put this plugin BELOW:
 *   - YEP_CoreEngine
 *   - YEP_BattleEngineCore
 *   - YEP_BuffsStatesCore
 *
 * State Notetag:
 *
 * <Help>
 * Your description here.
 * Multiple lines supported.
 * </Help>
 *
 * ============================================================================
 */

(function() {

"use strict";

var Imported = Imported || {};

///////////////////////////////////////////////////////////////////////////////
// Real Mouse Position
///////////////////////////////////////////////////////////////////////////////

var GPT_Mouse = {
    x: 0,
    y: 0
};

var _TouchInput_onMouseMove = TouchInput._onMouseMove;
TouchInput._onMouseMove = function(event) {
    _TouchInput_onMouseMove.call(this, event);

    GPT_Mouse.x = Graphics.pageToCanvasX(event.pageX);
    GPT_Mouse.y = Graphics.pageToCanvasY(event.pageY);
};

/* ---------------------------------------------------------------------------
 * Part 1 - Help Notetag Parser
 * ------------------------------------------------------------------------ */

(function() {

var _DM_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!_DM_isDatabaseLoaded.call(this)) return false;
    if (!this._gptStateHelpLoaded) {
        this._gptStateHelpLoaded = true;
        parseStateHelp();
    }
    return true;
};

function parseStateHelp() {
    for (var i = 1; i < $dataStates.length; i++) {
        var state = $dataStates[i];
        if (!state) continue;

        state.helpDescription = "";

        var note = state.note;

        // <Help: text>
        var single = note.match(/<Help:[ ]*(.+)>/i);
        if (single) {
            state.helpDescription = single[1].trim();
            continue;
        }

        // <Help>...</Help>
        var multi = note.match(/<Help>([\s\S]*?)<\/Help>/i);
        if (multi) {
            state.helpDescription = multi[1].trim();
        }
    }
}

})();

/* ---------------------------------------------------------------------------
 * Tooltip Text Builder
 * ------------------------------------------------------------------------ */

(function() {

Game_BattlerBase.prototype.stateTooltipText = function() {
    var lines = [];

    var buffs = [];
    var debuffs = [];

    for (var i = 0; i < 8; i++) {
        var level = this._buffs[i];
        if (!level) continue;

        var name = TextManager.param(i);

        if (Math.abs(level) > 1)
            name += " (x" + Math.abs(level) + ")";

        if (level > 0)
            buffs.push(name);
        else
            debuffs.push(name);
    }

    if (buffs.length)
        lines.push("Buffs: " + buffs.join(", "));

    if (debuffs.length)
        lines.push("Debuffs: " + debuffs.join(", "));

    if (lines.length && this.states().some(function(state) {
        return !!state.helpDescription;
    }))
        lines.push("");

    this.states().forEach(function(state) {
        if (!state.helpDescription) return;
        lines.push(state.name + ": " + state.helpDescription);
    });

    if (Imported.YEP_MessageCore)
        return "<WordWrap>\n" + lines.join("\n");

    return lines.join("\n");
};

})();


/* ---------------------------------------------------------------------------
 * Tooltip Sprite
 * ------------------------------------------------------------------------ */

(function(){

function Sprite_StateTooltip() {
    this.initialize.apply(this, arguments);
}

window.Sprite_StateTooltip = Sprite_StateTooltip;

Sprite_StateTooltip.prototype = Object.create(Sprite.prototype);
Sprite_StateTooltip.prototype.constructor = Sprite_StateTooltip;

Sprite_StateTooltip.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);

    this.bitmap = new Bitmap(1,1);

    this.visible = false;
    this._text = "";

    this._padding = 12;
    this._lineHeight = 24;
    this._fontSize = 20;
    this._maxWidth = 500;

    this.bitmap.fontSize = this._fontSize;

    this._measureBitmap = new Bitmap(1,1);
    this._measureBitmap.fontSize = this._fontSize;
};

Sprite_StateTooltip.prototype.wrapLine = function(line) {
    if (this._measureBitmap.measureTextWidth(line) <= this._maxWidth)
        return [line];

    var result = [];
    var words = line.split(" ");
    var current = "";
    var indent = "    ";

    for (var i = 0; i < words.length; i++) {

        var test = current.length ? current + " " + words[i] : words[i];

        if (this._measureBitmap.measureTextWidth(test) <= this._maxWidth) {
            current = test;
        } else {

            if (current.length)
                result.push(current);

            current = indent + words[i];
        }
    }

    if (current.length)
        result.push(current);

    return result;
};

Sprite_StateTooltip.prototype.setBattler = function(battler) {
    var text = battler ? battler.stateTooltipText() : "";

    if (text === this._text)
        return;

    this._text = text;
    this.refresh();
};

Sprite_StateTooltip.prototype.refresh = function() {
    if (!this._text) {
        this.visible = false;
        return;
    }

    var rawLines = this._text.replace("<WordWrap>\n","").split("\n");
    var lines = [];

    for (var i = 0; i < rawLines.length; i++) {
        lines = lines.concat(this.wrapLine(rawLines[i]));
    }

    var width = 0;

    for (var i = 0; i < lines.length; i++) {
        width = Math.max(
            width,
            this._measureBitmap.measureTextWidth(lines[i])
        );
    }

    width += this._padding * 2;
    width = Math.min(width, this._maxWidth + this._padding * 2);

    var height =
        lines.length * this._lineHeight +
        this._padding * 2;

    width += 8;
    height += 8;

    width = Math.max(width, 180);
    height = Math.max(height, 48);

    this.bitmap = new Bitmap(width, height);
    this.bitmap.fontSize = this._fontSize;
    this.bitmap.clear();

    var h = this._padding;

    width = this.bitmap.width;

    this.bitmap.paintOpacity = 215;
    this.bitmap.textColor = "#FFFFFF";
    this.bitmap.fillRect(
        0,
        0,
        width,
        this.bitmap.height,
        "#000000"
    );

    this.bitmap.paintOpacity = 255;

    this.bitmap.fillRect(0,0,width,1,"#FFFFFF");
    this.bitmap.fillRect(0,this.bitmap.height-1,width,1,"#FFFFFF");
    this.bitmap.fillRect(0,0,1,this.bitmap.height,"#FFFFFF");
    this.bitmap.fillRect(width-1,0,1,this.bitmap.height,"#FFFFFF");

    for (var i = 0; i < lines.length; i++) {
        var colon = lines[i].indexOf(": ");

        if (colon >= 0) {
            var name = lines[i].substring(0, colon + 1);
            var desc = lines[i].substring(colon + 2);

            this.bitmap.textColor = "#8FD8FF";

            this.bitmap.drawText(
                name,
                this._padding,
                h,
                width,
                this._lineHeight,
                "left"
            );

            var offset = this.bitmap.measureTextWidth(name + " ");

            this.bitmap.textColor = "#FFFFFF";

            this.bitmap.drawText(
                desc,
                this._padding + offset,
                h,
                width,
                this._lineHeight,
                "left"
            );

        } else {
            this.bitmap.textColor = "#FFFFFF";

            this.bitmap.drawText(
                lines[i],
                this._padding,
                h,
                width,
                this._lineHeight,
                "left"
            );
        }

        h += this._lineHeight;
    }

    this.visible = true;
};

})();

///////////////////////////////////////////////////////////////////////////////
// Hover Manager
///////////////////////////////////////////////////////////////////////////////

var StateHover = {
    actorRects: [],
    enemyRects: [],
    battler: null
};

StateHover.clear = function() {
    this.actorRects.length = 0;
    this.enemyRects.length = 0;
    this.battler = null;
};

StateHover.hit = function(mx, my, rect) {
    return mx >= rect.x &&
           mx <= rect.x + rect.width &&
           my >= rect.y &&
           my <= rect.y + rect.height;
};

///////////////////////////////////////////////////////////////////////////////
// Actor and enemy registration
///////////////////////////////////////////////////////////////////////////////

var _WB_drawActorIcons = Window_Base.prototype.drawActorIcons;
Window_Base.prototype.drawActorIcons = function(actor, x, y, width) {

    _WB_drawActorIcons.call(this, actor, x, y, width);

    var scene = SceneManager._scene;

    var valid =
        (scene instanceof Scene_Battle && this instanceof Window_BattleStatus) ||
        (scene instanceof Scene_Menu && this instanceof Window_MenuStatus);

    if (!valid) return;

    width = width || 144;

    var iconCount = Math.min(
        actor.allIcons().length,
        Math.floor(width / Window_Base._iconWidth)
    );

    if (iconCount <= 0) return;

    StateHover.actorRects.push({
        battler: actor,
        window: this,
        x: this.x + this.padding + x,
        y: this.y + this.padding + y,
        width: iconCount * Window_Base._iconWidth,
        height: Window_Base._iconHeight
    });
};

var _Sprite_StateIcon_update = Sprite_StateIcon.prototype.update;
Sprite_StateIcon.prototype.update = function() {

    _Sprite_StateIcon_update.call(this);

    if (!(SceneManager._scene instanceof Scene_Battle)) return;
    if (!this._battler) return;

    var point = this.worldTransform.apply(new PIXI.Point(0,0));

    StateHover.enemyRects.push({
        battler: this._battler,
        x: point.x - Window_Base._iconWidth/2,
        y: point.y - Window_Base._iconHeight/2,
        width: Window_Base._iconWidth,
        height: Window_Base._iconHeight
    });
};

///////////////////////////////////////////////////////////////////////////////
// Other stuff idfk
///////////////////////////////////////////////////////////////////////////////

(function(){

var _createAllWindows = Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
    _createAllWindows.call(this);

    this._stateTooltip = new Sprite_StateTooltip();
    this._stateTooltip.z = 9999;
    this.addChild(this._stateTooltip);
};

var _SceneMenu_create = Scene_Menu.prototype.create;
Scene_Menu.prototype.create = function() {
    _SceneMenu_create.call(this);

    this._stateTooltip = new Sprite_StateTooltip();
    this.addChild(this._stateTooltip);
};

var _update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function() {
    StateHover.enemyRects.length = 0;
    StateHover.actorRects.length = 0;

    _update.call(this);
    this.updateStateTooltip();
    if (!this._gptInitializedHover) {
    this._gptInitializedHover = true;
    this._statusWindow.refresh();
}
};

var _SceneMenu_update = Scene_Menu.prototype.update;
Scene_Menu.prototype.update = function() {

    StateHover.actorRects.length = 0;

    _SceneMenu_update.call(this);

    this.updateStateTooltip();
};

Scene_Battle.prototype.updateStateTooltip = function() {
    var tooltip = this._stateTooltip;

    StateHover.battler = null;

    if (this._statusWindow && StateHover.actorRects.length === 0)
        this._statusWindow.refresh();

    var mx = GPT_Mouse.x;
    var my = GPT_Mouse.y;

    // ----------------------------------------------------------
    // Actor hit test
    // ----------------------------------------------------------

    for (var i = 0; 
        i < StateHover.actorRects.length
        // loop only if the skill/item window are not visible
        && !(this._skillWindow && this._skillWindow.visible) 
        && !(this._itemWindow && this._itemWindow.visible);
        i++) {

        var rect = StateHover.actorRects[i];
        if (!rect.window.visible) continue;
        if (rect.window.openness <= 0) continue;

        if (StateHover.hit(mx,my,rect)) {
            if (!rect.battler.stateTooltipText()) continue;
            StateHover.battler = rect.battler;
            break;
        }
    }

    // ----------------------------------------------------------
    // Enemy hit test
    // ----------------------------------------------------------

    if (!StateHover.battler) {

        for (var i = 0; i < StateHover.enemyRects.length; i++) {

            var rect = StateHover.enemyRects[i];

            if (StateHover.hit(mx,my,rect)) {
                if (!rect.battler.stateTooltipText()) continue;
                StateHover.battler = rect.battler;
                break;
            }
        }
    }

    // ----------------------------------------------------------
    // Tooltip
    // ----------------------------------------------------------

    if (!StateHover.battler) {
        tooltip.visible = false;
        return;
    }

    tooltip.setBattler(StateHover.battler);

    tooltip.x = mx + 16;
    tooltip.y = my + 16;

    if (tooltip.x + tooltip.bitmap.width > Graphics.boxWidth)
        tooltip.x = Graphics.boxWidth - tooltip.bitmap.width;

    if (tooltip.y + tooltip.bitmap.height > Graphics.boxHeight)
        tooltip.y = Graphics.boxHeight - tooltip.bitmap.height;

    tooltip.visible = true;

    if (tooltip.parent) {
        tooltip.parent.setChildIndex(
            tooltip,
            tooltip.parent.children.length - 1
        );
    }
};

Scene_Menu.prototype.updateStateTooltip = function() {

    var tooltip = this._stateTooltip;

    if (!tooltip)
        return;

    StateHover.actorRects.length = 0;

    if (this._statusWindow)
        this._statusWindow.refresh();

    var mx = GPT_Mouse.x;
    var my = GPT_Mouse.y;

    var battler = null;

    for (var i = 0; i < StateHover.actorRects.length; i++) {

        var rect = StateHover.actorRects[i];

        if (StateHover.hit(mx,my,rect)) {

            if (!rect.battler.stateTooltipText())
                continue;

            battler = rect.battler;
            break;
        }
    }

    if (!battler) {
        tooltip.visible = false;
        return;
    }

    tooltip.setBattler(battler);

    tooltip.x = mx + 16;
    tooltip.y = my + 16;

    if (tooltip.x + tooltip.bitmap.width > Graphics.boxWidth)
        tooltip.x = Graphics.boxWidth - tooltip.bitmap.width;

    if (tooltip.y + tooltip.bitmap.height > Graphics.boxHeight)
        tooltip.y = Graphics.boxHeight - tooltip.bitmap.height;

    if (tooltip.parent) {
        tooltip.parent.setChildIndex(
            tooltip,
            tooltip.parent.children.length - 1
        );
    }

    tooltip.visible = true;
};

var _SceneBattle_start = Scene_Battle.prototype.start;
Scene_Battle.prototype.start = function() {
    _SceneBattle_start.call(this);

    this._statusWindow.refresh();
};

})();

})();