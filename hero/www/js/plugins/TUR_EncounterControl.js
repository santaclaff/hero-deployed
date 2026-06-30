//=============================================================================
// Encounter Control
// TUR_EncounterControl.js
//=============================================================================

window.Imported = window.Imported || {};
Imported.TUR_EncCon = true;

window.TUR = window.TUR || {};
TUR.EncCon = TUR.EncCon || {};
TUR.EncCon.version = 1.5;

/*:
 * @plugindesc Control various elements of random encounters
 * @author ATT_Turan
 * @version 1.5
 * @url https://forums.rpgmakerweb.com/index.php?threads/encounter-control-mv-mz.170130/
 * @target MZ
 * @help
 *
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin is designed to give more control over how random encounters are
 * treated. One half is giving a minimum number of steps between encounters, to
 * prevent the frustration of finishing a battle and getting into another
 * almost immediately.
 *
 * The other is tracking which troop was just fought, so as to prevent a repeat
 * of the same exact battle. If you have many troops listed in a map, you can
 * remember more than one, to force even more variety before the player sees a
 * repeat.
 *
 * Additionally, a notetag is provided to force the player to encounter specific
 * troops in a specific order, as well as one that disables encounters at a
 * given party level.
 *
 * As a non-control feature, an encounter gauge can be added to the map screen.
 * This uses images provided by the user which move as the player takes steps
 * and approaches their next encounter - this can make a gauge drain or fill,
 * amongst other things. Sample images are provided and may be freely used.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * Map Notetags
 *
 * <encountersteps: x>
 *
 * Where x is the decimal percent of Enc. Steps the player must have before an
 * encounter is possible. This overrides the Minimum Steps plugin parameter for
 * this specific map.
 *
 * Example: <encountersteps: .6>
 *
 * <encounterorder: x y z>
 *
 * List the troop IDs (no leading zeros) you wish the player to encounter, in
 * the order you wish them to be encountered. Once all troops have been
 * encountered, the list will start again from the beginning.
 *
 * This disregards any settings in the Encounters section of the map
 * properties.
 *
 * Example: <encounterorder: 12 8 15 22 49 6>
 *
 *
 * <rememberedtroops: x>
 *
 * Where x is the number of troops the game will track before allowing any
 * repeat encounters. Supplying a number larger than the number of troops you
 * have listed in the map properties will have no effect.
 *
 * Example: <rememberedtroops: 2> - will make the last 2 troops the player 
 * fought be ignored as candidates when determining which troop they are about
 * to encounter.
 *
 * <encounterlevel: x>
 *
 * Where x is the level at which the player will no longer get any random
 * encounters on this map. It is compared to the average level of all battle 
 * party members.
 *
 * <encounterregions: x:y a:b>
 *
 * Where each pair is a region ID followed by its modifier for steps toward an
 * encounter. Positive values will make steps in that region count more toward
 * an encounter, whereas negative values will make them count more slowly. Note
 * that any negative values must be a decimal value greater than -1 or it will
 * completely negate the step and encounters will never happen, aside from with
 * bush modifiers.
 *
 * Example: <encounterregions: 2:2 3:-.5 4:3>
 *
 * ============================================================================
 * Encounter Gauge
 * ============================================================================
 *
 * To create your own images for the encounter gauge, two images are needed.
 * The frame is displayed on a lower Z layer and should have whatever you want
 * to be revealed as the player walks. Transparency, a colored background, an
 * image, etc.
 *
 * This image can be any size, and the Frame X/Y plugin parameters determine
 * where on the screen the top left of the image is placed.
 *
 * The bar is drawn on top of the frame, and is increasingly cropped as the
 * player walks. Plugin parameters allow you to specify whether the bar has a
 * horizontal or vertical orientation, and which side the image crops from.
 *
 * This image can also be any size; by default, it is placed at the same
 * coordinates as the frame. There are plugin parameters to specify any offset
 * needed. Note that the canvas of the image should be flush against the side
 * the bar crops from; otherwise, some number of steps will appear to have no
 * effect on the gauge as it crops empty space.
 *
 * Both images should be placed in your project's img\pictures folder.
 *
 * If the included images are used in your project, credit should be given to
 * hiddenone.
 *
 * To use those images, select encountergauge-frame as the Gauge Frame, and
 * encountergauge-bar as the Gauge Bar. The Bar Y should have 42 as its offset.
 * You may position the gauge wherever you like, my suggestion is 50, 300.
 *
 * ============================================================================
 * Notes
 * ============================================================================
 *
 * When checking whether you have remembered as many troops as possible, the
 * plugin does not consider weights or region ranges. Therefore, it is possible
 * for you to break your encounters by setting the remembered troops value too
 * high when there aren't that many troops available in a given region.
 *
 * The Encounter Variable parameter is applied universally to all maps. You
 * might use it to have a value higher than 1 if you want it to be more
 * dangerous at night, for example, or use a lure item.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.5:
 * - Corrected a bug and added the Encounter Variable parameter
 *
 * Version 1.4:
 * - Corrected a bug that prevented normal random encounters
 *
 * Version 1.3:
 * - Option to control encounter rates by region ID added
 *
 * Version 1.2:
 * - Option to control bush encounter rates added
 *
 * Version 1.1:
 * - Encounter gauge added
 *
 * Version 1.0:
 * - Release version
 *
 * @param Minimum Steps
 * @desc The decimal percent of Enc. Steps the player must have before an encounter is possible.
 * @type value
 * @default .5
 *
 * @param Encounter Variable
 * @desc The variable storing the base encounter rate per step (default 1).
 * @type variable
 * @default 0
 *
 * @param Remembered Troops
 * @desc The number of troops the game will attempt to remember and not repeat.
 * @type value
 * @default 1
 *
 * @param Encounter Gauge
 * @desc Show a gauge that indicates encounter likelihood? true = yes, false = no.
 * @type boolean
 * @default false
 *
 * @param Gauge Frame
 * @desc The image file to use for the encounter gauge's frame.
 * @type file
 * @dir img\pictures
 * @require 1
 * @parent Encounter Gauge
 *
 * @param Frame X
 * @desc The X coordinate for the upper left corner of the encounter gauge's frame.
 * @type number
 * @default 0
 * @parent Gauge Frame
 *
 * @param Frame Y
 * @desc The Y coordinate for the upper left corner of the encounter gauge's frame.
 * @type number
 * @default 0
 * @parent Gauge Frame
 *
 * @param Gauge Bar
 * @desc The image file to use for the encouner gauge's bar.
 * @type file
 * @dir img\pictures
 * @require 1
 * @parent Encounter Gauge
 *
 * @param Bar X
 * @desc The X offset for the encounter gauge's bar from the frame.
 * @type string
 * @default 0
 * @parent Gauge Bar
 *
 * @param Bar Y
 * @desc The Y offset for the encounter gauge's bar from the frame.
 * @type string
 * @default 0
 * @parent Gauge Bar
 *
 * @param Gauge Orientation
 * @desc Whether the gauge empties vertically (true) or horizontally (false).
 * @type boolean
 * @default true
 * @parent Encounter Gauge
 *
 * @param Gauge Direction
 * @desc Which direction the gauge empties from: top/right (true) or bottom/left (false).
 * @type boolean
 * @default true
 * @parent Encounter Gauge
 *
 * @param Bush Rate
 * @desc The number of tiles the bush flag counts as.
 * @type number
 * @default 2
 *
 */
TUR.EncConParams = PluginManager.parameters("TUR_EncounterControl");

TUR.EncConGameSystemInitialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function()
{
	TUR.EncConGameSystemInitialize.call(this);
// index 0 is the number of troops to remember, 1 is the last map data was checked on, then troop IDs will be added
    this.rememberedTroops = [];
	this.rememberedTroops[0] = Number(TUR.EncConParams["Remembered Troops"]);
	this.rememberedTroops[1] = 0;
	this.encounterOrder = [];
	this.encounterSteps = 1;
// Region ID modifiers
	this.encounterRegions = [];
};

Game_Player.prototype.encounterProgressValue = function() 
{
    let value = $gameMap.isBush(this.x, this.y) ? Number(TUR.EncConParams["Bush Rate"]) : 
				Number(TUR.EncConParams["Encounter Variable"]) > 0 ? $gameVariables.value(Number(TUR.EncConParams["Encounter Variable"])) : 1;
	
	if ($gameSystem.encounterRegions[this.regionId()])
		value += $gameSystem.encounterRegions[this.regionId()];
	
    if ($gameParty.hasEncounterHalf()) 
        value *= 0.5;
    if (this.isInShip()) 
        value *= 0.5;
    return value;
};

TUR.executeEncounter = Game_Player.prototype.executeEncounter;
Game_Player.prototype.executeEncounter = function()
{
	if ($dataMap.meta.encounterlevel)
	{
		let average = 0;
		
		if (Imported.YEP_ClassChangeCore && !Yanfly.Param.CCCMaintainLv)
			$gameParty.battleMembers().forEach(actor => average += actor.classLevel(actor.currentClass().id));
		else
			$gameParty.battleMembers().forEach(actor => average += actor.level);
		average /= $gameParty.battleMembers().length;
		
		if (average >= Number($dataMap.meta.encounterlevel.trim()))
			return false;
	}
	
	return TUR.executeEncounter.call(this);
};

Game_Player.prototype.makeEncounterCount = function() 
{
    let n = $gameMap.encounterStep();
    this._encounterCount = Math.max(n * $gameSystem.encounterSteps, Math.randomInt(n) + Math.randomInt(n) + 1);
};

TUR.makeEncounterTroopId = Game_Player.prototype.makeEncounterTroopId;
Game_Player.prototype.makeEncounterTroopId = function() 
{
	let troopId = 0;

// If the map has an encounter order, grab the first in the list then cycle the order
	if ($gameSystem.encounterOrder.length)
	{
		troopId = $gameSystem.encounterOrder[0];
		
		for (let i=0; i < $gameSystem.encounterOrder.length - 1; i++)
			$gameSystem.encounterOrder[i] = $gameSystem.encounterOrder[i + 1];
		$gameSystem.encounterOrder[$gameSystem.encounterOrder.length - 1] = troopId;
	}
	else
		troopId = TUR.makeEncounterTroopId.call(this);

	if ($gameSystem.rememberedTroops[0] > 0)
	{
		// If we can remember more troops than we are now, just add the ID
		if ($gameSystem.rememberedTroops.length - 2 < $gameSystem.rememberedTroops[0])
			$gameSystem.rememberedTroops.push(troopId);
		// Otherwise cycle the remembered IDs and add this at the end
		else
		{
			for (let i=2; i < Math.min($gameSystem.rememberedTroops[0], $gameSystem.rememberedTroops.length - 2) - 1; i++)
				$gameSystem.rememberedTroops[i] = $gameSystem.rememberedTroops[i + 1];
			
			$gameSystem.rememberedTroops[$gameSystem.rememberedTroops.length - 1] = troopId;
		}
	}

    return troopId;
};

TUR.meetsEncounterConditions = Game_Player.prototype.meetsEncounterConditions;
Game_Player.prototype.meetsEncounterConditions = function(encounter) 
{
	let condition = TUR.meetsEncounterConditions.call(this, encounter);

	if (condition && $gameSystem.rememberedTroops[0] > 0 && $gameSystem.rememberedTroops[2])
	{
		let pastTroops = $gameSystem.rememberedTroops.slice(2);

		// Are we remembering this troop, and are there more troops possible that we're not remembering?
		if (pastTroops.includes(encounter.troopId) && pastTroops.length < $gameMap.encounterList().length)
			condition = false;
	}
	return condition;
};

TUR.mapCreateAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() 
{
	TUR.mapCreateAllWindows.call(this);

	if (TUR.EncConParams["Encounter Gauge"] == "true")
		this.createEncounterGauge();
};

Scene_Map.prototype.createEncounterGauge = function() 
{
	if (Utils.RPGMAKER_NAME=="MV")
		this._encounterGauge = new Window_Base();
	else
		this._encounterGauge = new Window_Base(new Rectangle(0, 0, 0, 0));
	
	this.addChild(this._encounterGauge);
	this._encounterGauge.opacity = 0;
	
	this._encounterGauge._frameSprite = new Sprite();
	this._encounterGauge._frameSprite.bitmap = ImageManager.loadPicture(TUR.EncConParams["Gauge Frame"]);
	this._encounterGauge.addChild(this._encounterGauge._frameSprite);
	
	let barTemp = ImageManager.loadPicture(TUR.EncConParams["Gauge Bar"]);
	barTemp.addLoadListener(() =>
	{
		this._encounterGauge._barSprite = new Sprite();
		this._encounterGauge._barSprite.bitmap = barTemp;
		this._encounterGauge.addChild(this._encounterGauge._barSprite);

// Is the gauge vertical and emptying from the top?
		if (TUR.EncConParams["Gauge Direction"] == "true" && TUR.EncConParams["Gauge Orientation"] == "true")
		{
			this._encounterGauge._barSprite.anchor.y = 1;
			this._encounterGauge._barSprite.y = this._encounterGauge._barSprite.bitmap.height;
//			this._encounterGauge._barSprite.y -= Number(TUR.EncConParams["Bar Y"]);
		}
// Is it horizontal and emptying from the left?
		else if (TUR.EncConParams["Gauge Direction"] == "false" && TUR.EncConParams["Gauge Orientation"] == "false")
		{
			this._encounterGauge._barSprite.anchor.x = 1;
			this._encounterGauge._barSprite.x = this._encounterGauge._barSprite.bitmap.width;
			this._encounterGauge._barSprite.x -= Number(TUR.EncConParams["Bar X"]);
		}
//		else
//		{
			this._encounterGauge._barSprite.y += Number(TUR.EncConParams["Bar Y"]);
			this._encounterGauge._barSprite.x += Number(TUR.EncConParams["Bar X"]);
//		}
	});

	this._encounterGauge.move(Number(TUR.EncConParams["Frame X"]), Number(TUR.EncConParams["Frame Y"]),
		this._encounterGauge._frameSprite.bitmap.width, this._encounterGauge._frameSprite.bitmap.height);
};

TUR.mapUpdate = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() 
{
	TUR.mapUpdate.call(this);

	if (TUR.EncConParams["Encounter Gauge"] == "true")
		this.updateEncounterGauge();
};

Scene_Map.prototype.updateEncounterGauge = function()
{
	let bar = this._encounterGauge._barSprite;
	let fill = Math.min($gamePlayer._encounterCount, $gameMap.encounterStep());
	let bx = bar.x;
	let by = bar.y;
	let bw = bar.bitmap.width;
	let bh = bar.bitmap.height;

	fill /= $gameMap.encounterStep();

// Is the gauge vertical
	if (TUR.EncConParams["Gauge Orientation"] == "true")
	{
		bh *= fill;
// Emptying from the top? Subtract from bottom Y anchor
		if (TUR.EncConParams["Gauge Direction"] == "true")
			by -= bh;
	}
// Is the gauge horizontal
	else
	{
		bw *= fill;
// Emptying from the left? Subtract from right X anchor
		if (TUR.EncConParams["Gauge Direction"] == "false")
			bx -= bw;
	}

	by -= Number(TUR.EncConParams["Bar Y"]);
	bx -= Number(TUR.EncConParams["Bar X"]);

	bar.setFrame(bx, by, bw, bh);
};

Scene_Map.prototype.onMapLoaded = function() 
{
    if (this._transfer) 
	{
        $gamePlayer.performTransfer();
		
		let numTroops = $dataMap.meta.rememberedtroops ? Number($dataMap.meta.rememberedtroops.trim()) : Number(TUR.EncConParams["Remembered Troops"]);
		$gameSystem.rememberedTroops = [numTroops, $gameMap.mapId()];
		
		if ($dataMap.meta.encounterorder)
			$gameSystem.encounterOrder = $dataMap.meta.encounterorder.trim().split(" ").map(Number);
		else
			$gameSystem.encounterOrder = [];
		
		if ($dataMap.meta.encountersteps)
			$gameSystem.encounterSteps = Number($dataMap.meta.encountersteps.trim());
		else
			$gameSystem.encounterSteps = Number(TUR.EncConParams["Minimum Steps"]);
		
		if ($dataMap.meta.encounterregions)
		{
			let regions = $dataMap.meta.encounterregions.trim().split(" ");
			regions.forEach(pair => {let index = pair.indexOf(":"); $gameSystem.encounterRegions[pair.substr(0, index)] = Number(pair.substr(index + 1))});
		}
		else
			$gameSystem.encounterRegions = [];
    }
    this.createDisplayObjects();
};