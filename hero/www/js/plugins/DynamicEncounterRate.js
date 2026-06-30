/*:
 * @plugindesc Dynamic Encounter Rate (EXP Progress-Based + Weighted Pool + Debug)
 * @author You
 *
 * @param Max Encounter Steps
 * @type number
 * @min 1
 * @default 150
 *
 * @param Enable Debug Logs
 * @type boolean
 * @default true
 *
 * @help
 * Logs encounter scaling values when entering a map or loading a game.
 */

(function() {

const parameters = PluginManager.parameters(document.currentScript.src.match(/([^\/]+)\.js$/)[1]);
const MAX_STEPS = Number(parameters["Max Encounter Steps"] || 150);
const DEBUG = String(parameters["Enable Debug Logs"]) === "true";

function getPartyExpToNextLevel() {
    const members = $gameParty.members();
    if (members.length === 0) return 100;

    let total = 0;

    members.forEach(actor => {
        const needed = actor.nextLevelExp() - actor.currentExp();
        total += Math.max(needed, 1);
    });

    return total / members.length;
}

function getAverageEncounterExp() {
    const encounterList = $gameMap.encounterList();
    if (!encounterList || encounterList.length === 0) return 10;

    let totalWeightedExp = 0;
    let totalWeight = 0;

    encounterList.forEach(enc => {
        const troop = $dataTroops[enc.troopId];
        if (!troop) return;

        let troopExp = 0;

        troop.members.forEach(member => {
            const enemy = $dataEnemies[member.enemyId];
            if (enemy) troopExp += enemy.exp;
        });

        const weight = enc.weight || 1;

        totalWeightedExp += troopExp * weight;
        totalWeight += weight;
    });

    if (totalWeight === 0) return 10;

    return Math.max(totalWeightedExp / totalWeight, 1);
}

function computeEncounterData() {
    const expGain = getAverageEncounterExp();
    const expNeeded = getPartyExpToNextLevel();
    const ratio = expGain / expNeeded;

    let multiplier;
    if (ratio > 0.25) multiplier = 1.2;
    else if (ratio > 0.10) multiplier = 1.0;
    else if (ratio > 0.03) multiplier = 0.6;
    else multiplier = 0.3;

    return { expGain, expNeeded, ratio, multiplier };
}

function logEncounterData() {
    if (!DEBUG) return;

    const data = computeEncounterData();

    console.log("=== Encounter Scaling Debug ===");
    console.log("Avg Troop EXP:", data.expGain.toFixed(2));
    console.log("EXP to Next Level:", data.expNeeded.toFixed(2));
    console.log("Ratio (Gain / Needed):", data.ratio.toFixed(4));
    console.log("Multiplier:", data.multiplier);
    console.log("===============================");
}

function getMultiplier() {
    return computeEncounterData().multiplier;
}

// Hook: when encounter count is set
const _makeEncounterCount = Game_Player.prototype.makeEncounterCount;
Game_Player.prototype.makeEncounterCount = function() {
    _makeEncounterCount.call(this);

    const mult = getMultiplier();

    this._encounterCount = Math.floor(this._encounterCount / mult);
    this._encounterCount = Math.min(this._encounterCount, MAX_STEPS);
};

// 🔥 Hook: map setup (entering map)
const _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    _Game_Map_setup.call(this, mapId);
    logEncounterData();
};

// 🔥 Hook: after loading a save
const _DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    _DataManager_extractSaveContents.call(this, contents);
    setTimeout(() => logEncounterData(), 0);
};

})();