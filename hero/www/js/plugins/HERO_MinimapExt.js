/*:
 * @target MV
 * @plugindesc Fog of War extension for UPP_MiniMap.
 * @author Gassy Gemerald
 *
 * @param Reveal Radius
 * @type number
 * @default 3
 * 
 * @param Fog Color
 * @default rgba(0,0,0,1)
 * 
 * @param Water Color
 * @default #3366ff
 * 
 * @param Luck Statue Common Events
 * @desc Comma-separated common event IDs.
 * @default
 *
 * @param Dungeon Shrine Common Events
 * @desc Comma-separated common event IDs.
 * @default
 * 
 * 
 */

(function() {

"use strict";

const params = PluginManager.parameters("HERO_MinimapExt");
const REVEAL_RADIUS = Number(params["Reveal Radius"] || 3);
const FOG_COLOR = params["Fog Color"] || "rgba(0,0,0,1)";
const WATER_COLOR = params["Water Color"] || "#3366ff";
const LUCK_EVENTS =
    String(params["Luck Statue Common Events"] || "")
        .split(",")
        .map(Number)
        .filter(Boolean);

const SHRINE_EVENTS =
    String(params["Dungeon Shrine Common Events"] || "")
        .split(",")
        .map(Number)
        .filter(Boolean);

const COLOR_TRANSFER = "#ff0000";
const COLOR_LUCK     = "#00aa00";
const COLOR_SHRINE   = "#ff7300ed";

const aliasGameSystemInit = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    aliasGameSystemInit.call(this);

    this._mmExplored = {};
};

const aliasPluginCommand = Game_Interpreter.prototype.pluginCommand;

Game_Interpreter.prototype.pluginCommand = function(command, args)
{
    aliasPluginCommand.call(this, command, args);

    if (command === "upp_minimap" && args[0] === "toggle")
    {
        if (_startMapHidden === "true")
        {
            this.pluginCommand("upp_minimap", ["show"]);
        }
        else
        {
            this.pluginCommand("upp_minimap", ["hide"]);
        }
    }
};

//--------------------------------------------------
// Exploration data
//--------------------------------------------------

function getExploredMap() {
    if (!$gameSystem._mmExplored) {
        $gameSystem._mmExplored = {};
    }

    const mapId = $gameMap.mapId();

    if (!$gameSystem._mmExplored[mapId]) {
        const data = new Array($dataMap.width);

        for (let x = 0; x < $dataMap.width; x++) {
            data[x] = new Uint8Array($dataMap.height);
        }

        $gameSystem._mmExplored[mapId] = data;
    }

    return $gameSystem._mmExplored[mapId];
}

//--------------------------------------------------
// Reveal tiles
//--------------------------------------------------

function revealAroundPlayer() {
    if (!$gameMap || !$dataMap) return;

    const explored = getExploredMap();

    const px = $gamePlayer.x;
    const py = $gamePlayer.y;

    let changed = false;

    for (let dx = -REVEAL_RADIUS; dx <= REVEAL_RADIUS; dx++) {

        for (let dy = -REVEAL_RADIUS; dy <= REVEAL_RADIUS; dy++) {

            if (dx * dx + dy * dy > REVEAL_RADIUS * REVEAL_RADIUS)
                continue;

            const x = px + dx;
            const y = py + dy;

            if (x < 0 || y < 0) continue;
            if (x >= $dataMap.width) continue;
            if (y >= $dataMap.height) continue;

            if (explored[x][y] === 0) {
                explored[x][y] = 1;
                changed = true;
            }
        }
    }

    if (changed && window.$miniMapWindow) {
        $miniMapWindow.refresh();
    }
}

function getAutomaticMarker(eventData)
{
    if (!eventData) return null;

    for (const page of eventData.pages)
    {
        for (const command of page.list)
        {
            switch (command.code)
            {
                case 201:
                    return COLOR_TRANSFER;

                case 117:
                {
                    const id = command.parameters[0];

                    if (LUCK_EVENTS.includes(id))
                        return COLOR_LUCK;

                    if (SHRINE_EVENTS.includes(id))
                        return COLOR_SHRINE;

                    break;
                }
            }
        }
    }

    return null;
}

//--------------------------------------------------
// Reveal only when player actually moves
//--------------------------------------------------

const aliasIncreaseSteps = Game_Player.prototype.increaseSteps;
Game_Player.prototype.increaseSteps = function() {

    aliasIncreaseSteps.call(this);

    revealAroundPlayer();
};

//--------------------------------------------------
// Reveal spawn position
//--------------------------------------------------

const aliasSceneMapStart = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {

    aliasSceneMapStart.call(this);

    revealAroundPlayer();
};

//--------------------------------------------------
// Override the refresher
//--------------------------------------------------

Window_Minimap.prototype.refresh = function()
{
    this.contents.clear();
    this.createContents();

    this.x = _pminiMap_X;
    this.y = _pminiMap_Y;

    this.width  = _pminiMap_Width * $dataMap.width  + _miniBorderSize * 2;
    this.height = _pminiMap_Width * $dataMap.height + _miniBorderSize * 2;

    this.createContents();

    const explored = getExploredMap();

    const RES_W = _pminiMap_Width;

    for (let x = 0; x < $dataMap.width; x++)
    {
        for (let y = 0; y < $dataMap.height; y++)
        {
            // Fog of War
            const px = x * RES_W;
            const py = y * RES_W;

            if (explored[x][y] === 0) {
                this.contents.fillRect(
                    px,
                    py,
                    RES_W,
                    RES_W,
                    FOG_COLOR
                );
                continue;
            }

            if (_pminiMap_useCM == "true")
            {
                if ($gameMap.checkPassage(x, y, 0x0F))
                {
                    this.contents.fillRect(
                        px,
                        py,
                        RES_W,
                        RES_W,
                        _pminiMap_PassColor
                    );
                }
            }

            const tileId = $gameMap.tileId(x, y, 0);

            if (Tilemap.isWaterTile(tileId) ||
                Tilemap.isWaterfallTile(tileId))
            {
                this.contents.fillRect(px, py, RES_W, RES_W, WATER_COLOR);
            }

            const regionColor = _mmRegionData[$gameMap.regionId(x, y)];

            if (regionColor != "NONE")
            {
                this.contents.fillRect(
                    px,
                    py,
                    RES_W,
                    RES_W,
                    regionColor
                );
            }
        }
    }
};

const aliasCreateMinimap = Scene_Map.prototype.createMinimap;

Scene_Map.prototype.createMinimap = function()
{
    aliasCreateMinimap.call(this);

    _shownEvents = 0;
    _minimapEvents = [];

    for (let i = 0; i < $gameMap._events.length; i++)
    {
        const gameEvent = $gameMap._events[i];
        const dataEvent = $dataMap.events[i];

        if (!gameEvent || !dataEvent)
            continue;

        let color = null;

        if (checkEventMeta(i, "mm_setColor:"))
        {
            color = getEventMeta(i, "mm_setColor:");
        }
        else
        {
            color = getAutomaticMarker(dataEvent);
        }

        if (color)
        {
            gameEvent.color = color;
            gameEvent.id = i;

            _minimapEvents.push(gameEvent);
            _shownEvents++;
        }
    }
};

PLAYER_LOCATOR.prototype.refresh = function()
{
    this.contents.clear();

    this.x = _pminiMap_X;
    this.y = _pminiMap_Y;

    this.width =
        _pminiMap_Width * $dataMap.width + _miniBorderSize * 2;

    this.height =
        _pminiMap_Width * $dataMap.height + _miniBorderSize * 2;

    const explored = getExploredMap();

    const RES_W = _pminiMap_Width;

    if (_pminiMap_showPlayer == "true")
    {
        switch (_mm_playerCircles)
        {
            case "false":
                this.contents.fillRect(
                    $gamePlayer.x * RES_W,
                    $gamePlayer.y * RES_W,
                    RES_W,
                    RES_W,
                    _pminiMap_playerColor
                );
                break;

            case "true":
                this.contents.drawCircle(
                    $gamePlayer.x * RES_W + RES_W / 2,
                    $gamePlayer.y * RES_W + RES_W / 2,
                    RES_W / 2,
                    _pminiMap_playerColor
                );
                break;
        }
    }

    if (_mm_showEvents == "true")
    {
        for (let i = 0; i < _minimapEvents.length; i++)
        {
            const ev = _minimapEvents[i];

            // Hide markers in unexplored fog
            if (
                !explored[ev.x] ||
                explored[ev.x][ev.y] === 0
            )
            {
                continue;
            }

            if (ev.beacon == true)
            {
                this.contents.paintOpacity = ev.beaconOpac;

                this.contents.drawCircle(
                    ev.x * RES_W + RES_W / 2,
                    ev.y * RES_W + RES_W / 2,
                    ev.beaconBlink,
                    ev.color
                );

                this.contents.paintOpacity = 255;

                ev.beaconBlink += ev.beaconSpeed;
                ev.beaconOpac -= ev.beaconFadeSpeed;

                ev.beaconOpac =
                    Math.min(Math.max(ev.beaconOpac, 0), 255);

                ev.beaconCounter++;

                if (ev.beaconCounter >= ev.beaconDelay)
                {
                    ev.beaconBlink = 0;
                    ev.beaconOpac = 255;
                    ev.beaconCounter = 0;
                }
            }

            switch (_mm_eventCircles)
            {
                case "false":
                    this.contents.fillRect(
                        ev.x * RES_W,
                        ev.y * RES_W,
                        RES_W,
                        RES_W,
                        ev.color
                    );
                    break;

                case "true":
                    this.contents.drawCircle(
                        ev.x * RES_W + RES_W / 2,
                        ev.y * RES_W + RES_W / 2,
                        RES_W / 2,
                        ev.color
                    );
                    break;
            }
        }
    }
};

})();