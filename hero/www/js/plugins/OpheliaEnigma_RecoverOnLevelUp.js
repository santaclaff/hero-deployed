//=============================================================================
// OpheliaEnigma_RecoverOnLevelUp.js
//=============================================================================

/*:
 * @plugindesc Recover a certain percentage to hp, tp and mp on level up.
 *
 * @author OpheliaEnigma
 *
 * @param hp percentage
 * @desc percentage of hp to recover on level up (set to 0 for no recover)
 * @default 100
 *
 * @param tp percentage
 * @desc percentage of tp to recover on level up (set to 0 for no recover)
 * @default 100
 *
 * @param mp percentage
 * @desc percentage of mp to recover on level up (set to 0 for no recover)
 * @default 100
 * 
 * @help
 *
 * This plugin recovers a certain percentage to hp, tp and mp on each level up.
 * 
 * The plugin has three parameters:
 * - hp percentage: percentage of hp to recover on level up (set to 0 for no recover)
 * - tp percentage: percentage of tp to recover on level up (set to 0 for no recover)
 * - mp percentage: percentage of mp to recover on level up (set to 0 for no recover)
 * 
 *                      COPYRIGHT NOTICE:
 *                      -----------------
 *
 * This plugin is free to be used for non-commercial projects, however, for
 * usage on commercial projects, please visit https://opheliaenigma.itch.io/
 * and donate the amount specified for this plugin. Any doubt don't hesitate
 * to contact me, OpheliaEnigma, either through the specified link or my
 * email address: OpheliaEnigmaUltimateCoder [at] gmail.com
 */


//=============================================================================
// OpheliaEnigma_RecoverOnLevelUp Code
//=============================================================================
(function() {
	
	// Get plugin parameters
	params = PluginManager.parameters('OpheliaEnigma_RecoverOnLevelUp');
	const _hpPer = Number(params["hp percentage"]) / 100;
	const _tpPer = Number(params["tp percentage"]) / 100;
	const _mpPer = Number(params["mp percentage"]) / 100;
	
	//=============================================================================
	// Game_Actor
	//=============================================================================
	const _GA_LU = Game_Actor.prototype.levelUp;
	Game_Actor.prototype.levelUp = function() {
		// Make sure to do the stuff that was in the function before
		_GA_LU.call(this);
		// Recover percentages
		this.setHp(Math.min(this._hp + this.mhp * _hpPer, this.mhp));
		this.setTp(Math.min(this._tp + this.maxTp() * _tpPer, this.maxTp()));
		this.setMp(Math.min(this._mp + this.mmp * _mpPer, this.mmp));
		this.refresh();
	};
})();