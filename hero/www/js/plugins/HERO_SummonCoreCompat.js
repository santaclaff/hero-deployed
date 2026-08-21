/*:
 * @plugindesc Compatibility fixes for SRD_SummonCore with YEP Party System, CTB, and Battle Engine Core.
 * @author Hero
 *
 * @help
 * Place beneath SRD_SummonCore.
 *
 * SRD_SummonCore adds temporary actors to battleMembers(), while RPG Maker MV
 * normally resolves a command actor from members(). With YEP Party System and
 * CTB, that mismatch skips a summon turn whenever its battle index is outside
 * the normal party array. This patch resolves command actors from the active
 * battle-member list and refreshes the battle-status window when a summon
 * enters battle.
 */

console.log("ku happy!");

(function() {
  'use strict';

  // Keep the normal four-slot layout for parties of four or fewer. Once a
  // summon makes a fifth combatant, use one column per combatant instead of
  // drawing that extra panel beyond the window's edge.
  if (Imported.YEP_BattleStatusWindow) {
    Yanfly.Param.BSWAdjustCol = false;
    Window_BattleStatus.prototype.maxCols = function() {
      var members = $gameParty.battleMembers().length;
      return members > 4 ? members : $gameParty.maxBattleMembers();
    };

    // YEP's front-view animation homes must use the same column count as the
    // status window. Otherwise, a fifth combatant has no matching location.
    Sprite_Actor.prototype.setActorHomeFrontView = function(index) {
      var statusHeight = Imported.YEP_BattleEngineCore ?
        Yanfly.Param.BECCommandRows : 4;
      statusHeight *= Window_Base.prototype.lineHeight.call(this);
      statusHeight += Window_Base.prototype.standardPadding.call(this) * 2;
      var screenW = Graphics.boxWidth;
      var windowW = Window_PartyCommand.prototype.windowWidth.call(this);
      screenW -= windowW;
      windowW /= 2;
      var members = $gameParty.battleMembers().length;
      var size = members > 4 ? members : $gameParty.maxBattleMembers();
      var homeX = screenW / size * index + windowW + screenW / (size * 2);
      homeX += Yanfly.Param.BSWXOffset;
      var homeY = Graphics.boxHeight - statusHeight;
      homeY += Yanfly.Param.BSWYOffset;
      this.setHome(homeX, homeY);
      this.moveToStartPosition();
    };

    // In front view, make SRD's summon sprite use the exact same home-position
    // path as a normal actor. Side-view summons retain SRD's relative position.
    var _Sprite_Summon_setActorHome = Sprite_Summon.prototype.setActorHome;
    Sprite_Summon.prototype.setActorHome = function(index) {
      if (!$gameSystem.isSideView() && Yanfly.Param.BSWAlignAni) {
        Sprite_Actor.prototype.setActorHome.call(this, index);
      } else {
        _Sprite_Summon_setActorHome.call(this, index);
      }
    };
  }

  // A normal skill animation is handled by Battle Engine Core as an action
  // animation. For a summon, that is the caster-side animation the editor
  // normally associates with the skill. Use that animation as SRD's summon
  // intro instead, then clear the ordinary action animation.
  var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  var _summonAnimationsPrepared = false;
  DataManager.isDatabaseLoaded = function() {
    if (!_DataManager_isDatabaseLoaded.call(this)) return false;
    if (_summonAnimationsPrepared) return true;
    for (var i = 1; i < $dataSkills.length; i++) {
      var skill = $dataSkills[i];
      if (!skill || !skill.summonInfo || skill.animationId <= 0) continue;
      for (var j = 0; j < skill.summonInfo.length; j++) {
        var info = skill.summonInfo[j];
        // An explicit <Summon> Animation: x tag always wins.
        if (String(info.ani) === String(SRD.SummonCore.defaults.ani)) {
          info.ani = String(skill.animationId);
        }
      }
      skill.animationId = 0;
    }
    _summonAnimationsPrepared = true;
    return true;
  };

  // CTB stores the active battler as a battle-member index. Summons only exist
  // in battleMembers(), never in the permanent members() roster.
  var _BattleManager_actor = BattleManager.actor;
  BattleManager.actor = function() {
    if ($gameParty.inBattle() && this._actorIndex >= 0) {
      return $gameParty.battleMembers()[this._actorIndex] || null;
    }
    return _BattleManager_actor.call(this);
  };

  // MV normally rebuilds an action's actor subject from its database actor ID.
  // A Game_Summon intentionally shares that ID with its permanent template
  // actor, so MV would validate and pay costs using the level-1 template
  // instead of the live summon. Preserve the temporary battler instance on
  // actions created by summons, while retaining MV's normal lookup for all
  // other actors and enemies.
  var _Game_Action_setSubject = Game_Action.prototype.setSubject;
  Game_Action.prototype.setSubject = function(subject) {
    _Game_Action_setSubject.call(this, subject);
    this._summonSubject = subject instanceof Game_Summon ? subject : null;
  };

  var _Game_Action_subject = Game_Action.prototype.subject;
  Game_Action.prototype.subject = function() {
    return this._summonSubject || _Game_Action_subject.call(this);
  };

  // SRD registers the battler sprite but does not refresh YEP's status window,
  // leaving a mid-battle summon without a face/HP/MP panel.
  var _Game_Action_createSummons = Game_Action.prototype.createSummons;
  Game_Action.prototype.createSummons = function() {
    var summons = _Game_Action_createSummons.call(this);
    if (summons.length > 0) {
      var scene = SceneManager._scene;
      if (scene && scene._statusWindow) scene._statusWindow.refresh();
      if (BattleManager.refreshStatus) BattleManager.refreshStatus();
      if (!$gameSystem.isSideView() && BattleManager._spriteset) {
        var sprites = BattleManager._spriteset._actorSprites;
        for (var i = 0; i < sprites.length; i++) {
          if (sprites[i]._battler) sprites[i].setActorHome(i);
        }
        var activeSummons = $gameParty.summonMembers();
        for (var j = 0; j < activeSummons.length; j++) {
          var summon = activeSummons[j];
          var sprite = summon.battleSprite();
          if (sprite) sprite.setActorHome(summon.index());
        }
      }
    }
    return summons;
  };
})();
