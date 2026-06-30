//=============================================================================
// OpheliaEnigma_EnemyKillCounters.js
//=============================================================================

/*:
 * @plugindesc Allows the developer to save the number of defeated enemies on
 * different game variables.
 *
 * @author OpheliaEnigma
 *
 * @param first variable
 * @desc will hold the total number of enemies defeated.
 * @default 100
 * 
 * @help
 *
 * Allows the developer to save the number of defeated enemies on
 * different game variables. The first one, chosen by the developer on the
 * plugin's parameter, will hold the total number of enemies defeated. Then,
 * the game variable right next to that one (the first + 1) will hold the number
 * of enemies defeated with the database id 1; the game variable equal to the
 * first one + 2 will hold the number of enemies defeated with the database id 2;
 * And so forth.
 *
 * VERY IMPORTANT NOTE: The variables must exist on the database for the counters
 * to work.
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
// OpheliaEnigma_EnemyKillCounters Code
//=============================================================================
(function() {
	// get plugin parameters
	params = PluginManager.parameters('OpheliaEnigma_EnemyKillCounters');
	const _varMin = Number(params["first variable"]);

	//=============================================================================
	// Game_Enemy
	//=============================================================================
	var GEP = Game_Enemy.prototype.performCollapse;
	Game_Enemy.prototype.performCollapse = function() {
		GEP.call(this);
		const increment = function (gameVar){
			const newValue = $gameVariables.value(gameVar)+1;
			$gameVariables.setValue(gameVar, newValue);
		}
		if(this._enemyId > 0 ) {
			increment(_varMin);
			increment(_varMin + this._enemyId);
		}
	}
})();