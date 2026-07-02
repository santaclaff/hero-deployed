/*:
 * @plugindesc GPT Momentum System v1.0
 * @author GPT
 *
 * Simple momentum combo system.
 * Repeating the same damaging skill consecutively increases Momentum.
 * Momentum increases damage by:
 *
 *   1 + 0.01 * n * (n + 1)
 *
 * Momentum is broken when:
 * - the momentum skill misses every target
 * - the battler cannot move at turn end
 * - a non-momentum skill is used
 *
 * Guard-type skills preserve Momentum.
 *
 * Popup fields written to Game_ActionResult:
 *   momentumGain     (number)
 *   momentumBreak    (boolean)
 *   subjectMomentum  (number)
 * 
 * Plugin command: MomentumPopup Show | Hide
 */

(function() {

function momentumCountsAsGuard(item) {
	if (!item || !item.effects) return false;
	return item.effects.some(function(effect) {
		if (effect.code !== Game_Action.EFFECT_ADD_STATE) return false;
		var state = $dataStates[effect.dataId];
		if (!state) return false;
		return state.traits.some(function(trait) {
			return trait.code === Game_BattlerBase.TRAIT_SPECIAL_FLAG &&
				trait.dataId === Game_BattlerBase.FLAG_ID_GUARD;
		});
	});
}

var _GS_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    _GS_initialize.call(this);
    this._momentumPopupsEnabled = false;
};

// plugin command for showing
var _GI_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _GI_pluginCommand.call(this, command, args);

    if (command === "MomentumPopup") {
        if (args[0] === "Show") $gameSystem._momentumPopupsEnabled = true;
        if (args[0] === "Hide") $gameSystem._momentumPopupsEnabled = false;
    }
};

//-----------------------------------------------------------------------------
// Battler
//-----------------------------------------------------------------------------

Game_Battler.prototype.initMomentum = function() {
	this._momentum = 0;
	this._lastMomentumSkillId = 0;
};

Game_Battler.prototype.momentum = function() {
	return this._momentum || 0;
};

Game_Battler.prototype.momentumMultiplier = function() {
	var m = this.momentum();
	return 1 + 0.01 * m * (m + 1);
};

Game_Battler.prototype.resetMomentum = function() {
	this._momentum = 0;
	this._lastMomentumSkillId = 0;
};

Game_Battler.prototype.breakMomentum = function(reason) {
	if (this._momentum > 0) {
		this.result().momentumBreak = true;
	}

	//console.log(this.result());

	this.resetMomentum();

	if (reason) {
		//console.log(this.name() + " Momentum Broken (" + reason + ")");
	}
};

Game_Battler.prototype.gainMomentum = function(skillId) {

	if (this._lastMomentumSkillId === skillId) {
		this._momentum++;
		this.result().momentumGain = 1;
	} else {
		this._momentum = 0;
		this._lastMomentumSkillId = skillId;
	}

	this.result().subjectMomentum = this._momentum;
	//console.log("RESULT =", this.result().subjectMomentum);

	/*console.log(
		this.name() +
		" Momentum=" + this._momentum +
		" Bonus=" + Math.round((this.momentumMultiplier() - 1) * 100) + "%"
	);*/
};

var _GB_initMembers = Game_Battler.prototype.initMembers;
Game_Battler.prototype.initMembers = function() {
	_GB_initMembers.call(this);
	this.initMomentum();
};

var _GB_onTurnEnd = Game_Battler.prototype.onTurnEnd;
Game_Battler.prototype.onTurnEnd = function() {
	_GB_onTurnEnd.call(this);

	if (this.isBattleMember() && !this.canMove()) {
		this.breakMomentum("Cannot Move");
		this.startDamagePopup();
	}
};

var _GB_onBattleEnd = Game_Battler.prototype.onBattleEnd;
Game_Battler.prototype.onBattleEnd = function() {
	_GB_onBattleEnd.call(this);
	this.resetMomentum();
};

//-----------------------------------------------------------------------------
// Action Result (Popup Communication)
//-----------------------------------------------------------------------------

var _GAR_clear = Game_ActionResult.prototype.clear;
Game_ActionResult.prototype.clear = function() {
	_GAR_clear.call(this);

	this.momentumGain = 0;
	this.momentumBreak = false;
	this.subjectMomentum = 0;
};

//-----------------------------------------------------------------------------
// Damage Bonus
//-----------------------------------------------------------------------------

var _GA_makeDamageValue = Game_Action.prototype.makeDamageValue;
Game_Action.prototype.makeDamageValue = function(target, critical) {
	var value = _GA_makeDamageValue.call(this, target, critical);

	if (this.isSkill()) {
		value = Math.round(value * this.subject().momentumMultiplier());
	}

	return value;
};

//-----------------------------------------------------------------------------
// Track Successful Hits
//-----------------------------------------------------------------------------

var _BM_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
	_BM_startAction.call(this);

	var action = this._subject ? this._subject.currentAction() : null;

	if (action) {
		action._momentumHits = 0;
	}
};

var _GA_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
	_GA_apply.call(this, target);

	if (!this.isSkill()) return;

	if (target.result().isHit()) {
		this._momentumHits = (this._momentumHits || 0) + 1;
	}
};

//-----------------------------------------------------------------------------
// Momentum Resolution
//-----------------------------------------------------------------------------

var _BM_endAction = BattleManager.endAction;
BattleManager.endAction = function() {

	var subject = this._subject;
	var action = subject ? subject.currentAction() : null;

	if (subject && action && action.isSkill()) {

		var item = action.item();
		var skillId = item.id;

		var isMomentumSkill =
			item.damage.type === 1 ||
			item.damage.type === 5;

		if (momentumCountsAsGuard(item)) {

			//console.log(subject.name() + " Momentum Preserved (Guard)");

		} else if (!isMomentumSkill) {

			if (subject.momentum() > 0) {
				//console.log(subject.name() + " Momentum Reset (Non-Momentum Skill)");
			}

			subject.resetMomentum();

		} else if ((action._momentumHits || 0) <= 0) {

			subject.breakMomentum("No Hits");
			subject.startDamagePopup();

		} else {

			subject.gainMomentum(skillId);
			//console.log(subject.result());
			subject.startDamagePopup();

		}
	}

	_BM_endAction.call(this);
};

})();