//=============================================================================
// HERO_PirateMonkeyMobilePatch.js
//=============================================================================
/*:
 * @plugindesc v1.00 Recovers Pirate Monkey animation waits that stall on mobile.
 * @author HERO
 *
 * @help
 * This compatibility patch leaves desktop battles and every non-Pirate Monkey
 * action alone. On mobile only, it watches YEP_BattleEngineCore's
 * "WAIT FOR ANIMATION" step for Pirate Monkey (enemy #103). If the renderer
 * still claims an animation is playing after its complete database duration
 * plus a short grace period, the wait is released so the CTB battle can resume.
 *
 * Normal animation timing is unchanged unless recovery activates. A console
 * warning is emitted only when a stuck wait is actually recovered.
 */

var Imported = Imported || {};
Imported.HERO_PirateMonkeyMobilePatch = true;

(function() {
  'use strict';

  var PIRATE_MONKEY_ID = 103;
  var GRACE_FRAMES = 30;
  var _Window_BattleLog_updateWaitMode = Window_BattleLog.prototype.updateWaitMode;

  function isMobilePirateMonkeyAction() {
    if (!Utils.isMobileDevice || !Utils.isMobileDevice()) return false;
    var subject = BattleManager._subject;
    return subject && subject.isEnemy && subject.isEnemy() &&
      subject.enemyId() === PIRATE_MONKEY_ID;
  }

  function actionAnimationLimit() {
    var action = BattleManager._action;
    var item = action && action.item ? action.item() : null;
    var animation = item && item.animationId >= 0 ?
      $dataAnimations[item.animationId] : null;
    var frameCount = animation && animation.frames ? animation.frames.length : 0;
    // MV animation frames last four game frames each.
    return Math.max(1, frameCount * 4 + GRACE_FRAMES);
  }

  Window_BattleLog.prototype.updateWaitMode = function() {
    var waiting = _Window_BattleLog_updateWaitMode.call(this);

    if (!waiting || this._waitMode !== 'animation' || !isMobilePirateMonkeyAction()) {
      this._heroPirateMonkeyAnimationWait = 0;
      return waiting;
    }

    this._heroPirateMonkeyAnimationWait =
      (this._heroPirateMonkeyAnimationWait || 0) + 1;
    var limit = actionAnimationLimit();
    if (this._heroPirateMonkeyAnimationWait <= limit) return waiting;

    console.warn('[HERO_PirateMonkeyMobilePatch] Recovered a stuck animation wait.', {
      enemyId: PIRATE_MONKEY_ID,
      skill: BattleManager._action && BattleManager._action.item(),
      waitedFrames: this._heroPirateMonkeyAnimationWait,
      limit: limit
    });
    this._waitMode = '';
    this._heroPirateMonkeyAnimationWait = 0;
    return false;
  };
})();
