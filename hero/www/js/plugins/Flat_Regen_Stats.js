//=============================================================================
// Flat Regen Stats
// Flat_Regen_Stats.js
//=============================================================================

/*:
 * @plugindesc v1.00 Adds flat HP / MP regeneration as a stat.
 * Supports actors, enemies, equipment, and states. Negative values allowed.
 * @author You
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * RPG Maker MV provides built-in HP and MP regeneration rates, but they are
 * percentage-based and scale automatically with max HP and MP.
 *
 * This plugin introduces flat HP and MP regeneration as stats instead.
 * These values are applied once per turn during battle.
 *
 * - Positive values regenerate HP / MP
 * - Negative values drain HP / MP (DoT)
 * - All sources stack additively
 *
 * Sources supported:
 * - Actors
 * - Enemies
 * - Weapons
 * - Armors
 * - States
 *
 * This allows regeneration and damage-over-time to be handled by a single,
 * unified stat system.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * Place the following notetags in any of the supported database objects.
 *
 *   <Flat HP Regen: x>
 *   <Flat MP Regen: x>
 *
 * Where x is a flat numeric value per turn.
 *
 * Examples:
 *
 *   <Flat HP Regen: 5>     // Regenerate 5 HP per turn
 *   <Flat HP Regen: -3>    // Lose 3 HP per turn
 *
 *   <Flat MP Regen: 2>     // Regenerate 2 MP per turn
 *   <Flat MP Regen: -1>    // Lose 1 MP per turn
 *
 * Notes:
 * - Values stack from all sources.
 * - Regen is applied only during battle.
 * - This does not replace % HP/MP regen — both can coexist.
 *
 * ============================================================================
 * End of Help
 * ============================================================================
 */

(function() {

  //===========================================================================
  // DataManager - Notetag Processing
  //===========================================================================

  const _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function() {
    if (!_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!this._flatRegenLoaded) {
      this.processFlatRegenNotetags($dataActors);
      this.processFlatRegenNotetags($dataEnemies);
      this.processFlatRegenNotetags($dataWeapons);
      this.processFlatRegenNotetags($dataArmors);
      this.processFlatRegenNotetags($dataStates);
      this._flatRegenLoaded = true;
    }
    return true;
  };

  DataManager.processFlatRegenNotetags = function(group) {
    if (!group) return;
    for (let i = 1; i < group.length; i++) {
      const obj = group[i];
      if (!obj) continue;

      obj.flatHpRegen = 0;
      obj.flatMpRegen = 0;

      const notedata = obj.note.split(/[\r\n]+/);
      for (const line of notedata) {
        if (line.match(/<Flat HP Regen:[ ]([-+]?\d+)>/i)) {
          obj.flatHpRegen += Number(RegExp.$1);
        }
        if (line.match(/<Flat MP Regen:[ ]([-+]?\d+)>/i)) {
          obj.flatMpRegen += Number(RegExp.$1);
        }
      }
    }
  };

  //===========================================================================
  // Game_BattlerBase - Regen Stat Accessors
  //===========================================================================

  Game_BattlerBase.prototype.flatHpRegen = function() {
    let value = 0;

    if (this.isActor()) {
      value += this.actor().flatHpRegen || 0;
      this.equips().forEach(e => value += e ? e.flatHpRegen || 0 : 0);
    } else {
      value += this.enemy().flatHpRegen || 0;
    }

    this.states().forEach(s => value += s.flatHpRegen || 0);
    return value;
  };

  Game_BattlerBase.prototype.flatMpRegen = function() {
    let value = 0;

    if (this.isActor()) {
      value += this.actor().flatMpRegen || 0;
      this.equips().forEach(e => value += e ? e.flatMpRegen || 0 : 0);
    } else {
      value += this.enemy().flatMpRegen || 0;
    }

    this.states().forEach(s => value += s.flatMpRegen || 0);
    return value;
  };

  //===========================================================================
  // Game_Battler - Apply Regen Each Turn
  //===========================================================================

  const _Game_Battler_regenerateAll = Game_Battler.prototype.regenerateAll;
  Game_Battler.prototype.regenerateAll = function() {
    _Game_Battler_regenerateAll.call(this);

    if (!$gameParty.inBattle() || !this.isAlive()) return;

    const hp = this.flatHpRegen();
    const mp = this.flatMpRegen();

    this.clearResult();

    if (hp !== 0) this.gainHp(hp);
    if (mp !== 0) this.gainMp(mp);

    if (hp !== 0 || mp !== 0) {
        this.startDamagePopup();
    }
  };

})();
