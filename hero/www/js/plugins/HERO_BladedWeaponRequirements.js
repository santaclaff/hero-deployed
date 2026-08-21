/*:
 * @plugindesc v1.00 Adds a reusable equipped-bladed-weapon requirement for skills.
 * @author Hero
 *
 * @param Bladed Weapon Type IDs
 * @desc Comma-separated weapon-type IDs considered bladed.
 * @default 1,2,4,10
 *
 * @help
 * Skill notetag:
 *   <Require Bladed Weapon>
 *
 * The requirement checks every equipped weapon through Game_Actor.weapons(),
 * including weapons in YEP Equip Core's additional weapon slots. Enemies
 * bypass the actor-equipment requirement, preserving their shared AI skills.
 */

var Imported = Imported || {};
Imported.HERO_BladedWeaponRequirements = true;

(function() {
  'use strict';

  var params = PluginManager.parameters('HERO_BladedWeaponRequirements');
  var bladedWeaponTypeIds =
    String(params['Bladed Weapon Type IDs'] || '').split(',')
    .map(function(id) { return Number(id.trim()); })
    .filter(function(id) { return id > 0; });

  var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  var notetagsLoaded = false;
  DataManager.isDatabaseLoaded = function() {
    if (!_DataManager_isDatabaseLoaded.call(this)) return false;
    if (notetagsLoaded) return true;
    for (var i = 1; i < $dataSkills.length; i++) {
      var skill = $dataSkills[i];
      if (!skill) continue;
      skill.requireBladedWeapon =
        /<\s*Require\s+Bladed\s+Weapon\s*>/i.test(skill.note);
    }
    notetagsLoaded = true;
    return true;
  };

  Game_BattlerBase.prototype.hasBladedWeaponEquipped = function() {
    if (!this.isActor()) return true;
    return this.weapons().some(function(weapon) {
      return weapon && bladedWeaponTypeIds.indexOf(weapon.wtypeId) >= 0;
    });
  };

  var _Game_BattlerBase_meetsSkillConditions =
    Game_BattlerBase.prototype.meetsSkillConditions;
  Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
    if (!_Game_BattlerBase_meetsSkillConditions.call(this, skill)) return false;
    if (skill && skill.requireBladedWeapon &&
        !this.hasBladedWeaponEquipped()) return false;
    return true;
  };
})();
