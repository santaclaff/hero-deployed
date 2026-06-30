//=============================================================================
/*:
* @plugindesc v1.00 (Requires YEP_X_BattleSysATB.js) 
* @author Nathan Pringle
*
* @help
* This will ensure that the speed value of an ability is honoured. Place underneath YEP_X_BattleSysATB.js.
* @param Ability Modifier
* @desc The additional ability charge given a specific ability selected.
* Default: 5 * (this.currentAction().speed() - this.agi)
* @default 5 * (this.currentAction().speed() - this.agi)
*
* @param Minimum ATB Boost
* @parent ---Escape---
* @type number
* @decimals 3
* @desc The minimum amount the ATB gauge will charge by. A value of less than zero will disable this feature.
* @default 0.001
*/
//=============================================================================

var Yanfly = Yanfly || {};

if (Imported.YEP_BattleEngineCore) {

    if (Yanfly.BEC.version && Yanfly.BEC.version >= 1.42) {

        //=============================================================================
        // Parameter Variables
        //=============================================================================

        Yanfly.Parameters = PluginManager.parameters('NP_ATBBattleSystemEdit');
        Yanfly.Param = Yanfly.Param || {};

        Yanfly.Param.NP_AbilityModifier = String(Yanfly.Parameters['Ability Modifier']);
        Yanfly.Param.NP_MinimumATBBoost = String(Yanfly.Parameters['Minimum ATB Boost']);
    }
}

Game_Battler.prototype.updateATB = function () {
    if (this.isDead()) return this.resetAllATB();
    if (!this.canMove()) {
        this.updateATBStates();
        return;
    }
    if (this.isATBCharging()) {
        if (!this.currentAction()) this.resetAllATB();
        if (this.currentAction() && this.currentAction().item() === null) {
            this.resetAllATB();
        }
    }
    if (this.isATBCharging()) {

        var abilityModifier = eval(Yanfly.Param.NP_AbilityModifier);
        console.log(abilityModifier);
        var value = this.atbCharge() + this.atbSpeedTick() + abilityModifier;

        if (Yanfly.Param.NP_MinimumATBBoost >= 0) {
            value = Math.max(value, Yanfly.Param.NP_MinimumATBBoost);
        }

        this.setATBCharge(value);
    } else if (this.atbRate() < 1) {
        var value = this.atbSpeed() + this.atbSpeedTick();
        this.setATBSpeed(value);
    }
};