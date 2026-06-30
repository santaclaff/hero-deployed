//-----------------------------------------------------------------------------
//  Galv's Random Encounter Conditions
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_RandEncounterConditions.js
//-----------------------------------------------------------------------------
//  2017-11-23 - Version 1.2 - fixed multiple condition bug.
//                             added ability to eval scripts as conditions
//  2016-11-10 - Version 1.1 - fixed bug with region id encounters
//  2016-10-23 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_RandEncounterConditions = true;

var Galv = Galv || {};                  // Galv's main object
Galv.RECOND = Galv.RECOND || {};          // Galv's stuff

// Galv Notetag setup (Add notes required for this plugin if not already added)
Galv.noteFunctions = Galv.noteFunctions || [];       // Add note function to this.

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.2) Have random encounter troops only appear in certain conditions
 * 
 * @author Galv - galvs-scripts.com
 *
 * @help
 *   Galv's Random Encounter Conditions
 * ----------------------------------------------------------------------------
 * This plugin allows you to set certain condition that control if troops will
 * be encountered in normal random encounters or not.
 * ----------------------------------------------------------------------------
 *
 * ----------------------------------------------------------------------------
 *   COMMENTS for TROOPS
 * ----------------------------------------------------------------------------
 * These tags must be placed in comments on the FIRST troop page to work. Each
 * tag must be in a separate comment to use multiple conditions.
 *
 *   <encSwitch:x,status>   // x is switch ID, status is either off or on.
 *
 *   <encVar:x,amount>      // x is the variable ID, amount is the number the
 *                          // variable should be equal or greater than
 *
 *   <encItem:x,amount>     // x is the item ID, amount is the number of items
 *                          // needed to be equal or greater than
 *
 *
 * For more advanced users, you can also evaluate javascript code to determine
 * if the troop can be encountered. This is done using the comment:
 *
 *   <encScript:code>       // Where code is the eval javascript string.
 *
 * ----------------------------------------------------------------------------
 * Remember, the troops must still appear in the map's random encounter list
 * and it will still take into account the normal weight and region IDs.
 * ----------------------------------------------------------------------------
 */


//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

Galv.RECOND.hasCondition = function(troopId) {
	return $dataTroops[troopId].encCond;
};

Galv.RECOND.conditionResult = function(troopId) {
	var result = true;
	var t = $dataTroops[troopId].encCond;
	if (t) {
		if (t.switch) result = $gameSwitches.value(t.switch.id) == t.switch.status;
		if (t.var && result) result = $gameVariables.value(t.var.id) >= t.var.amount;
		if (t.item && result) result = $gameParty.numItems($dataItems[t.item.id]) >= t.item.amount;
		if (t.script && result) result = eval(t.script.evalTxt);
	}
	return result;
};


//-----------------------------------------------------------------------------
//  NOTE TAGS
//-----------------------------------------------------------------------------

if (!Galv.notetagAlias) {   // Add alias only if not added by another Galv plugin
	Galv.RECOND.Scene_Boot_start = Scene_Boot.prototype.start;
	Scene_Boot.prototype.start = function() {	
		for (var i = 0;i < Galv.noteFunctions.length; i++) {
			Galv.noteFunctions[i]();	
		};
		Galv.RECOND.Scene_Boot_start.call(this);
	};
	Galv.notetagAlias = true;
};

Galv.RECOND.notetags = function() {
	// Troop Notes
	
	var length = $dataTroops.length;
	for (var i = 1; i < length; i++) {
		var list = $dataTroops[i].pages[0].list;
		
		for (var j = 0; j < list.length; j++) {
			if (list[j].code === 108 || list[j].code === 408) {
				var cond = list[j].parameters[0].match(/<encSwitch:(.*)>/i);
				if (cond) {
					cond = cond[1].split(",");
					$dataTroops[i].encCond = $dataTroops[i].encCond || {};
					$dataTroops[i].encCond.switch = {id: Number(cond[0]), status: cond[1] == 'on' ? true : false};
				};
				
				cond = list[j].parameters[0].match(/<encVar:(.*)>/i);
				if (cond) {
					cond = cond[1].split(",");
					$dataTroops[i].encCond = $dataTroops[i].encCond || {};
					$dataTroops[i].encCond.var = {id: Number(cond[0]), amount: Number(cond[1])};
				};
				
				cond = list[j].parameters[0].match(/<encItem:(.*)>/i);
				if (cond) {
					cond = cond[1].split(",");
					$dataTroops[i].encCond = $dataTroops[i].encCond || {};
					$dataTroops[i].encCond.item = {id: Number(cond[0]), amount: Number(cond[1])};
				};
				
				cond = list[j].parameters[0].match(/<encScript:(.*)>/i);
				if (cond) {
					$dataTroops[i].encCond = $dataTroops[i].encCond || {};
					console.log(cond[1]);
					$dataTroops[i].encCond.script = {evalTxt: cond[1]};
				};
			};
		};
	};
};

Galv.noteFunctions.push(Galv.RECOND.notetags);


//-----------------------------------------------------------------------------
//  PLUGIN CODE
//-----------------------------------------------------------------------------

Galv.RECOND.Game_Player_meetsEncounterConditions = Game_Player.prototype.meetsEncounterConditions;
Game_Player.prototype.meetsEncounterConditions = function(encounter) {
	var canEncounter = Galv.RECOND.Game_Player_meetsEncounterConditions.call(this,encounter);
	if (canEncounter) {
		if (Galv.RECOND.hasCondition(encounter.troopId)) {
			return Galv.RECOND.conditionResult(encounter.troopId);
		} else {
			return true;
		}
	} else {
		return false;
	}
};

})();
