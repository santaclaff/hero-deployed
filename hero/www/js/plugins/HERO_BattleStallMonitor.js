//=============================================================================
// HERO_BattleStallMonitor.js
//=============================================================================
/*:
 * @plugindesc v1.10 On-screen diagnostic and recovery for stalled battles.
 * @author HERO
 *
 * @help
 * This temporary diagnostic patch watches battles for 10 seconds of no state
 * progress. When that happens it draws a report on the battle screen and
 * stores the same report in $gameSystem._heroBattleStallReport. The report
 * includes a short timeline before the stall, targets, visual wait status,
 * forced-action state, and battle-member HP/state snapshots.
 *
 * If the only thing holding the battle is a visual wait (animation, effect,
 * movement, or damage-popup wait), the patch releases that wait after showing
 * the report. It never skips an action, forces a turn, or changes a skill.
 *
 * If the battle is stuck for another reason, the report remains visible so it
 * can be screenshotted without needing access to a developer console.
 *
 * Desktop test: press F7 during a battle to display a harmless sample report.
 * This does not alter the battle or release any waits.
 */

var Imported = Imported || {};
Imported.HERO_BattleStallMonitor = true;

(function() {
  'use strict';

  var STALL_FRAMES = 600;
  var VISUAL_WAIT_MODES = ['animation', 'effect', 'movement', 'popups'];
  var MAX_HISTORY = 8;
  var desktopTestRequested = false;

  window.addEventListener('keydown', function(event) {
    // F7 is only a desktop test shortcut; mobile devices have no practical
    // way to invoke it.
    if (event.keyCode === 118) desktopTestRequested = true;
  });

  function battlerName(battler) {
    return battler && battler.name ? battler.name() : '(none)';
  }

  function actionName(action) {
    var item = action && action.item ? action.item() : null;
    return item ? item.name + ' #' + item.id : '(none)';
  }

  function battlerSnapshot(battler) {
    if (!battler) return null;
    var states = battler.states ? battler.states().map(function(state) {
      return state.id;
    }) : [];
    return {
      name: battlerName(battler),
      hp: battler.hp,
      mhp: battler.mhp,
      states: states,
      ctbCharging: !!(battler.isCTBCharging && battler.isCTBCharging()),
      ctbOrder: battler.ctbTurnOrder ? battler.ctbTurnOrder() : null,
      action: actionName(battler.currentAction && battler.currentAction())
    };
  }

  function stallInfo(scene) {
    var log = BattleManager._logWindow;
    var subject = BattleManager._subject;
    var action = BattleManager._action || (subject && subject.currentAction());
    var spriteset = scene._spriteset;
    return {
      phase: BattleManager._phase || '(none)',
      subject: battlerName(subject),
      action: actionName(action),
      waitMode: log ? log._waitMode || '(none)' : '(no log)',
      waitCount: log ? log._waitCount || 0 : 0,
      logMethodCount: log && log._methods ? log._methods.length : 0,
      forcedAction: !!BattleManager._processingForcedAction,
      preForcePhase: BattleManager._preForcePhase || '(none)',
      eventRunning: $gameTroop && $gameTroop.isEventRunning(),
      animationPlaying: !!(spriteset && spriteset.isAnimationPlaying &&
        spriteset.isAnimationPlaying()),
      ctbTicks: BattleManager._ctbTicks || 0
    };
  }

  function historyKey(info) {
    return [info.phase, info.subject, info.action, info.waitMode,
      info.forcedAction, info.eventRunning, info.animationPlaying].join('|');
  }

  function updateHistory(scene, info) {
    var key = historyKey(info);
    if (scene._heroBattleStallHistoryKey === key) return;
    scene._heroBattleStallHistoryKey = key;
    var history = scene._heroBattleStallHistory || [];
    history.push({
      frame: Graphics.frameCount,
      phase: info.phase,
      subject: info.subject,
      action: info.action,
      waitMode: info.waitMode,
      forcedAction: info.forcedAction
    });
    if (history.length > MAX_HISTORY) history.shift();
    scene._heroBattleStallHistory = history;
  }

  function addDiagnosticDetails(scene, info) {
    var log = BattleManager._logWindow;
    var spriteset = scene._spriteset;
    info.targets = (BattleManager._targets || []).map(battlerName);
    info.logMethods = log && log._methods ? log._methods.slice(0, 5).map(
      function(method) { return method.name; }) : [];
    info.visuals = {
      animation: !!(spriteset && spriteset.isAnimationPlaying &&
        spriteset.isAnimationPlaying()),
      effect: !!(spriteset && spriteset.isEffecting && spriteset.isEffecting()),
      movement: !!(spriteset && spriteset.isAnyoneMoving &&
        spriteset.isAnyoneMoving()),
      popups: !!(spriteset && spriteset.isPopupPlaying &&
        spriteset.isPopupPlaying())
    };
    info.party = $gameParty.battleMembers().map(battlerSnapshot);
    info.troop = $gameTroop.members().map(battlerSnapshot);
    info.timeline = (scene._heroBattleStallHistory || []).slice(0);
    return info;
  }

  function progressKey(info) {
    var key = [info.phase, info.subject, info.action, info.waitMode,
      info.waitCount, info.forcedAction, info.eventRunning,
      info.animationPlaying];
    // CTB's tick counter changes continuously while CTB is making progress.
    if (info.phase === 'ctb') key.push(info.ctbTicks);
    return key.join('|');
  }

  function showNotice(scene, info, recovered) {
    if (!scene._heroBattleStallNotice) {
      var sprite = new Sprite(new Bitmap(Graphics.boxWidth, 168));
      sprite.x = 0;
      sprite.y = 0;
      scene._heroBattleStallNotice = sprite;
      scene.addChild(sprite);
    }
    var bitmap = scene._heroBattleStallNotice.bitmap;
    // Keep a recovered-stall report on screen long enough to screenshot.
    scene._heroBattleStallNoticeFrames = 300;
    scene._heroBattleStallNotice.visible = true;
    bitmap.clear();
    bitmap.fillRect(0, 0, Graphics.boxWidth, 168, 'rgba(0, 0, 0, 0.78)');
    bitmap.textColor = '#ffffff';
    bitmap.outlineColor = '#000000';
    bitmap.outlineWidth = 3;
    bitmap.fontSize = 20;
    var headline = info.manualDesktopTest ? 'Battle-stall monitor desktop test.' :
      (recovered ? 'Battle stall recovered: visual wait released.' :
      'Battle stall detected: screenshot this message.');
    bitmap.drawText(headline, 12, 4,
      Graphics.boxWidth - 24, 28);
    bitmap.fontSize = 17;
    bitmap.drawText('Phase: ' + info.phase + '    Wait: ' + info.waitMode +
      '    Animation: ' + info.animationPlaying, 12, 34,
      Graphics.boxWidth - 24, 24);
    bitmap.drawText('Subject: ' + info.subject + '    Action: ' + info.action,
      12, 58, Graphics.boxWidth - 24, 24);
    bitmap.drawText('Forced action: ' + info.forcedAction + '    Event: ' +
      info.eventRunning + '    CTB ticks: ' + info.ctbTicks, 12, 82,
      Graphics.boxWidth - 24, 24);
    bitmap.drawText('Targets: ' + (info.targets || []).join(', ') +
      '    Log queue: ' + info.logMethodCount, 12, 106,
      Graphics.boxWidth - 24, 24);
    var trail = (info.timeline || []).slice(-2).map(function(entry) {
      return entry.phase + '/' + entry.subject + '/' + entry.action +
        ' [' + entry.waitMode + ']';
    }).join('  ->  ');
    bitmap.drawText('Trail: ' + trail, 12, 130, Graphics.boxWidth - 24, 24);
  }

  function hideNotice(scene) {
    if (scene._heroBattleStallNotice) scene._heroBattleStallNotice.visible = false;
  }

  function updateNotice(scene) {
    if (!scene._heroBattleStallNoticeFrames) return;
    scene._heroBattleStallNoticeFrames -= 1;
    if (scene._heroBattleStallNoticeFrames <= 0) hideNotice(scene);
  }

  function recordStall(scene, info) {
    addDiagnosticDetails(scene, info);
    var log = BattleManager._logWindow;
    var recovered = log && VISUAL_WAIT_MODES.indexOf(info.waitMode) >= 0;
    info.recoveredVisualWait = recovered;
    info.frame = Graphics.frameCount;
    if ($gameSystem) $gameSystem._heroBattleStallReport = info;
    console.warn('[HERO_BattleStallMonitor] Battle stall detected.', info);
    showNotice(scene, info, recovered);
    if (recovered) log._waitMode = '';
  }

  function showDesktopTest(scene) {
    var info = addDiagnosticDetails(scene, stallInfo(scene));
    info.recoveredVisualWait = false;
    info.frame = Graphics.frameCount;
    info.manualDesktopTest = true;
    showNotice(scene, info, false);
  }

  var _Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function() {
    _Scene_Battle_update.call(this);
    updateNotice(this);
    if (!BattleManager || BattleManager._phase === 'battleEnd') return;

    var info = stallInfo(this);
    updateHistory(this, info);
    if (desktopTestRequested && !Utils.isMobileDevice()) {
      desktopTestRequested = false;
      showDesktopTest(this);
    }
    // Waiting for the player to choose a command is normal, not a stall.
    if (info.phase !== 'action' && info.phase !== 'ctb') {
      this._heroBattleStallKey = undefined;
      this._heroBattleStallFrames = 0;
      this._heroBattleStallReported = false;
      return;
    }
    var key = progressKey(info);
    if (this._heroBattleStallKey !== key) {
      this._heroBattleStallKey = key;
      this._heroBattleStallFrames = 0;
      this._heroBattleStallReported = false;
      return;
    }

    this._heroBattleStallFrames = (this._heroBattleStallFrames || 0) + 1;
    if (this._heroBattleStallReported ||
        this._heroBattleStallFrames < STALL_FRAMES) return;
    this._heroBattleStallReported = true;
    recordStall(this, info);
  };
})();
