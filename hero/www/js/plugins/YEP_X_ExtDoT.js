//=============================================================================
// Yanfly Engine Plugins - Buffs & States Extension - Extended Damage Over Time
// YEP_X_ExtDoT.js  (MODIFIED: MP Regen / MP DoT Support)
//=============================================================================

/*:
 * @plugindesc v1.05 (Req YEP_BattleEngineCore & YEP_BuffsStatesCore)
 * Create custom HP and MP damage over time & regeneration effects.
 * @author Yanfly Engine Plugins + Tigress Collaboration
 *
 * @param ---Defaults---
 * @default
 *
 * @param Regen Animation
 * @parent ---Defaults---
 * @type animation
 * @desc When creating a regen state, this will be the default animation.
 * Leave at 0 to play no animation.
 * @default 46
 *
 * @param DoT Animation
 * @type animation
 * @desc When creating a DoT state, this will be the default animation.
 * Leave at 0 to play no animation.
 * @default 59
 *
 * @param Default Variance
 * @type number
 * @desc This is the default variance value for Extended DoT formulas.
 * Leave at 0 for no variance.
 * @default 20
 *
 * @param Default Element
 * @type number
 * @desc This is the default element used for Extended DoT formulas.
 * Leave at 0 for no element.
 * @default 0
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires both YEP_BattleEngineCore && YEP_BuffsStatesCore.
 * Make sure this plugin is located under both required plugins in the
 * plugin manager.
 *
 * RPG Maker MV does not provide the ability to utilize custom formulas for
 * HP or MP damage and regeneration over time through states. This plugin,
 * through the aid of Yanfly's Buffs & States Core, allows you to apply
 * custom formulas for HP and MP regeneration, damage over time, variance
 * control, elemental rate modifiers, and animations.
 *
 * This is a collaboration plugin by Tigress and Yanfly to ensure
 * compatibility with the Yanfly Engine Plugins library.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * Insert the following notetags into your states to achieve their respective
 * regeneration or damage over time effects.
 *
 * State Notetags:
 *
 *   ---
 *
 *   <Regen Animation: x>
 *   <DoT Animation: x>
 *   - This will make the state play animation x when HP or MP regeneration
 *   or damage over time occurs.
 *
 *   Examples:
 *     <Regen Animation: 41>
 *     <DoT Animation: 59>
 *
 *   ---
 *
 *   <Regen Formula: x>
 *   - This will regenerate x HP each turn.
 *
 *   <DoT Formula: x>
 *   - This will deal x HP damage each turn.
 *
 *   Examples:
 *     <Regen Formula: 100>
 *     <Regen Formula: a.mdf * 2>
 *     <DoT Formula: a.mat * 2>
 *
 *   ---
 *
 *   <MP Regen Formula: x>
 *   - This will regenerate x MP each turn.
 *
 *   <MP DoT Formula: x>
 *   - This will deal x MP damage each turn.
 *
 *   Examples:
 *     <MP Regen Formula: 5>
 *     <MP Regen Formula: a.mdf * 0.5>
 *     <MP DoT Formula: b.mmp * 0.1>
 *
 *   ---
 *
 *   <Regen Element: x>
 *   <DoT Element: x>
 *   <MP Regen Element: x>
 *   <MP DoT Element: x>
 *   - The element applied to the regeneration or damage over time effect.
 *   The target's elemental rate will be applied.
 *
 *   ---
 *
 *   <Regen Variance: x%>
 *   <DoT Variance: x%>
 *   <MP Regen Variance: x%>
 *   <MP DoT Variance: x%>
 *   - The amount of variance applied to the effect.
 *
 * ============================================================================
 * Lunatic Mode - Custom DoT Formula
 * ============================================================================
 *
 * For users with JavaScript experience, the following notetags allow for
 * more complex HP and MP damage or regeneration logic.
 *
 *   ---
 *
 *   <Custom Regen Formula>
 *    value = a.level * 8;
 *    variance = 15;
 *    element = 3;
 *   </Custom Regen Formula>
 *
 *   <Custom DoT Formula>
 *    value = a.hp / 50;
 *    variance = 10;
 *    element = 2;
 *   </Custom DoT Formula>
 *
 *   ---
 *
 *   <Custom MP Regen Formula>
 *    value = a.level * 3;
 *    variance = 10;
 *    element = 4;
 *   </Custom MP Regen Formula>
 *
 *   <Custom MP DoT Formula>
 *    value = b.mmp * 0.1;
 *    variance = 5;
 *    element = 5;
 *   </Custom MP DoT Formula>
 *
 * ============================================================================
 * Notes
 * ============================================================================
 *
 * - All damage and regeneration effects occur only during battle.
 * - Healing values are automatically treated as positive values.
 * - Damage values are automatically converted to negative values.
 * - MP regeneration and damage uses gainMp() internally.
 * - HP regeneration and damage uses gainHp() internally.
 *
 * ============================================================================
 * End of Help
 * ============================================================================
 */


if (Imported.YEP_BattleEngineCore && Imported.YEP_BuffsStatesCore) {

var Imported = Imported || {};
Imported.YEP_X_ExtDoT = true;

var Yanfly = Yanfly || {};
Yanfly.EDoT = Yanfly.EDoT || {};
Yanfly.EDoT.version = 1.05;

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('YEP_X_ExtDoT');
Yanfly.Param = Yanfly.Param || {};

Yanfly.Param.EDoTRegenAni = Number(Yanfly.Parameters['Regen Animation']);
Yanfly.Param.EDoTDamageAni = Number(Yanfly.Parameters['DoT Animation']);
Yanfly.Param.EDoTDefVariance = Number(Yanfly.Parameters['Default Variance']);
Yanfly.Param.EDoTDefElement = Number(Yanfly.Parameters['Default Element']);

//=============================================================================
// DataManager
//=============================================================================

Yanfly.EDoT.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!Yanfly.EDoT.DataManager_isDatabaseLoaded.call(this)) return false;

  if (!Yanfly._loaded_YEP_X_ExtDoT) {
    this.processEDoTNotetags1($dataStates);
    Yanfly._loaded_YEP_X_ExtDoT = true;
  }

  return true;
};

DataManager.processEDoTNotetags1 = function(group) {
  for (var n = 1; n < group.length; n++) {
    var obj = group[n];
    var notedata = obj.note.split(/[\r\n]+/);

    obj.dotAnimation = 0;
    obj.dotElement = Yanfly.Param.EDoTDefElement;
    obj.dotVariance = Yanfly.Param.EDoTDefVariance;
    obj.dotFormula = '';
    obj.dotType = 'hp'; // hp or mp

    var evalMode = 'none';

    for (var i = 0; i < notedata.length; i++) {
      var line = notedata[i];

      if (line.match(/<(?:REGEN|DOT) ANIMATION:[ ](\d+)>/i)) {
        obj.dotAnimation = parseInt(RegExp.$1);

      // HP REGEN
      } else if (line.match(/<(?:REGEN|REGENERATE) FORMULA:[ ](.*)>/i)) {
        obj.dotFormula = 'value = Math.max(0, ' + RegExp.$1 + ');\nhealing = true;';
        obj.dotType = 'hp';
        if (obj.dotAnimation === 0) obj.dotAnimation = Yanfly.Param.EDoTRegenAni;

      // HP DOT
      } else if (line.match(/<(?:DOT|DAMAGE OVER TIME) FORMULA:[ ](.*)>/i)) {
        obj.dotFormula = 'value = Math.max(0, ' + RegExp.$1 + ');\nhealing = false;';
        obj.dotType = 'hp';
        if (obj.dotAnimation === 0) obj.dotAnimation = Yanfly.Param.EDoTDamageAni;

      // MP REGEN
      } else if (line.match(/<(?:MP REGEN) FORMULA:[ ](.*)>/i)) {
        obj.dotFormula = 'value = Math.max(0, ' + RegExp.$1 + ');\nhealing = true;';
        obj.dotType = 'mp';
        if (obj.dotAnimation === 0) obj.dotAnimation = Yanfly.Param.EDoTRegenAni;

      // MP DOT
      } else if (line.match(/<(?:MP DOT|MP DAMAGE OVER TIME) FORMULA:[ ](.*)>/i)) {
        obj.dotFormula = 'value = Math.max(0, ' + RegExp.$1 + ');\nhealing = false;';
        obj.dotType = 'mp';
        if (obj.dotAnimation === 0) obj.dotAnimation = Yanfly.Param.EDoTDamageAni;

      } else if (line.match(/<(?:REGEN|DOT|MP REGEN|MP DOT) VARIANCE:[ ](\d+)([%％])>/i)) {
        obj.dotVariance = parseInt(RegExp.$1);

      } else if (line.match(/<(?:REGEN|DOT|MP REGEN|MP DOT) ELEMENT:[ ](\d+)>/i)) {
        obj.dotElement = parseInt(RegExp.$1);

      } else if (line.match(/<(?:CUSTOM REGEN FORMULA|CUSTOM DOT FORMULA|CUSTOM MP REGEN FORMULA|CUSTOM MP DOT FORMULA)>/i)) {
        evalMode = 'custom';
        if (line.match(/MP/i)) obj.dotType = 'mp';

      } else if (line.match(/<\/(?:CUSTOM REGEN FORMULA|CUSTOM DOT FORMULA|CUSTOM MP REGEN FORMULA|CUSTOM MP DOT FORMULA)>/i)) {
        obj.dotFormula += (obj.dotFormula.includes('healing = false') ? '' : '');
        evalMode = 'none';

      } else if (evalMode === 'custom') {
        obj.dotFormula += line + '\n';
      }
    }
  }
};

//=============================================================================
// Game_Battler
//=============================================================================

Yanfly.EDoT.Game_Battler_regenerateAll = Game_Battler.prototype.regenerateAll;
Game_Battler.prototype.regenerateAll = function() {
  if (this.isAlive() && $gameParty.inBattle()) {
    this.processDamageOverTimeStates();
  }
  Yanfly.EDoT.Game_Battler_regenerateAll.call(this);
};

Game_Battler.prototype.processDamageOverTimeStates = function() {
  if (!$gameParty.inBattle()) return;
  var result = JsonEx.makeDeepCopy(this._result);
  var states = this.states().slice();
  for (var i = 0; i < states.length; i++) {
    this.processDamageOverTimeStateEffect(states[i]);
  }
  this._result = result;
};

Game_Battler.prototype.processDamageOverTimeStateEffect = function(state) {
  if (!state || !state.dotFormula) return;

  var a = this.stateOrigin(state.id);
  var b = this;
  var user = this;
  var target = this;
  var origin = a;
  var s = $gameSwitches._data;
  var v = $gameVariables._data;

  var value = 0;
  var healing = false;
  var variance = state.dotVariance;
  var element = state.dotElement;

  try {
    eval(state.dotFormula);

    value = Math.abs(value);
    if (!healing) value *= -1;

    value = this.applyDamageOverTimeVariance(value, variance);
    value = this.applyDamageOverTimeElement(value, element);
    value = Math.round(value);

    if (value !== 0) {
      this.clearResult();

      if (state.dotType === 'mp') {
        this.gainMp(value);
      } else {
        this.gainHp(value);
      }

      this.startDamagePopup();
      if (state.dotAnimation > 0) this.startAnimation(state.dotAnimation);
      if (this.isDead()) this.performCollapse();
      this.clearResult();
    }

  } catch (e) {
    Yanfly.Util.displayError(e, state.dotFormula, 'CUSTOM DOT ' + state.id + ' ERROR');
  }
};

Game_Battler.prototype.applyDamageOverTimeVariance = function(damage, vari) {
  if (vari === 0) return damage;
  var amp = Math.floor(Math.abs(damage) * vari / 100);
  var v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
  return damage >= 0 ? damage + v : damage - v;
};

Game_Battler.prototype.applyDamageOverTimeElement = function(damage, element) {
  if (element === 0) return damage;
  return damage * this.elementRate(element);
};

//=============================================================================
// Utilities
//=============================================================================

Yanfly.Util = Yanfly.Util || {};
Yanfly.Util.displayError = function(e, code, message) {
  console.error(message);
  console.error(code);
  console.error(e);
};

} else {
  console.error('YEP_X_ExtDoT requires YEP_BattleEngineCore and YEP_BuffsStatesCore.');
}
