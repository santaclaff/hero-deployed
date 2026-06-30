/*:
 * @plugindesc v1.3 True two-handed weapons + full auto-replacement system.
 * Requires YEP_EquipCore, YEP_X_EquipRequirements, YEP_WeaponUnleash
 * @author You
 *
 * @help
 * ============================================================================
 * Behavior
 * ============================================================================
 *
 * - Two-handed weapons auto-unequip the other slot
 * - One-handed weapons auto-replace two-handed weapons
 * - No equip blocking — everything resolves automatically
 *
 * - Slot 0 → Attack Weapon
 * - Slot 1 → Guard Weapon
 *
 * ============================================================================
 */

(function() {

  if (!Imported.YEP_EquipCore ||
      !Imported.YEP_X_EquipRequirements ||
      !Imported.YEP_WeaponUnleash) {
    console.error('YEP_TwoHandedWeaponsPlus: Missing required Yanfly plugins.');
    return;
  }

  //===========================================================================
  // DataManager - Skill Name → ID
  //===========================================================================

  DataManager.getSkillIdFromHandedTag = function(text) {
    if (!text) return 0;
    text = String(text).trim();

    if (/^\d+$/.test(text)) return Number(text);

    const upper = text.toUpperCase();
    let foundId = 0;

    for (let i = 1; i < $dataSkills.length; i++) {
      const skill = $dataSkills[i];
      if (skill && skill.name &&
          skill.name.toUpperCase() === upper) {
        foundId = i;
      }
    }
    return foundId;
  };

  //===========================================================================
  // DataManager - Notetags
  //===========================================================================

  const _DM_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function() {
    if (!_DM_isDatabaseLoaded.call(this)) return false;

    if (!this._loaded_TwoHandedWeaponsPlus) {
      this.processTwoHandedWeaponsPlus($dataWeapons);
      this._loaded_TwoHandedWeaponsPlus = true;
    }
    return true;
  };

  DataManager.processTwoHandedWeaponsPlus = function(group) {
    for (let i = 1; i < group.length; i++) {
      const w = group[i];
      if (!w) continue;

      w.twoHanded = /<Two\s*Handed>/i.test(w.note);

      w.handedReplaceAttack = 0;
      w.handedReplaceGuard  = 0;
      w.handedReplaceAuto   = 0;

      const lines = w.note.split(/[\r\n]+/);
      for (const line of lines) {
        if (line.match(/<Handed Replace Attack:\s*(.+)>/i)) {
          w.handedReplaceAttack =
            DataManager.getSkillIdFromHandedTag(RegExp.$1);

        } else if (line.match(/<Handed Replace Guard:\s*(.+)>/i)) {
          w.handedReplaceGuard =
            DataManager.getSkillIdFromHandedTag(RegExp.$1);

        } else if (line.match(/<Handed Replace:\s*(.+)>/i)) {
          w.handedReplaceAuto =
            DataManager.getSkillIdFromHandedTag(RegExp.$1);
        }
      }
    }
  };

  //===========================================================================
  // Equip Requirements (ALWAYS ALLOW — let auto system handle it)
  //===========================================================================

  const _meetEquipEval =
    Game_BattlerBase.prototype.meetEquipEvalRequirements;

  Game_BattlerBase.prototype.meetEquipEvalRequirements = function(item, slotId) {
    if (!_meetEquipEval.call(this, item, slotId)) return false;
    if (!item || !DataManager.isWeapon(item)) return true;

    // Always allow weapon equips — logic handled in changeEquip
    return true;
  };

  //===========================================================================
  // AUTO-UNEQUIP / AUTO-REPLACE SYSTEM
  //===========================================================================

  const _changeEquip = Game_Actor.prototype.changeEquip;
  Game_Actor.prototype.changeEquip = function(slotId, item) {

    const equips = this.equips();

    // -----------------------------
    // EQUIPPING TWO-HANDED
    // -----------------------------
    if (item && DataManager.isWeapon(item) && item.twoHanded) {

      const otherSlot = (slotId === 0) ? 1 : 0;
      const otherItem = equips[otherSlot];

      if (otherItem && DataManager.isWeapon(otherItem)) {
        _changeEquip.call(this, otherSlot, null);
      }
    }

    // -----------------------------
    // EQUIPPING ONE-HANDED
    // -----------------------------
    if (item && DataManager.isWeapon(item) && !item.twoHanded) {

      for (let i = 0; i < equips.length; i++) {
        const w = equips[i];
        if (w && w.twoHanded) {
          _changeEquip.call(this, i, null);
        }
      }
    }

    _changeEquip.call(this, slotId, item);
  };

  //===========================================================================
  // Slot Helpers
  //===========================================================================

  Game_Actor.prototype.mainHandWeapon = function() {
    return this.equips()[0];
  };

  Game_Actor.prototype.offHandWeapon = function() {
    return this.equips()[1];
  };

  //===========================================================================
  // Weapon Unleash Integration
  //===========================================================================

  const _clearReplace =
    Game_BattlerBase.prototype.clearReplaceAttackGuard;

  Game_BattlerBase.prototype.clearReplaceAttackGuard = function() {
    this._handedAttack = undefined;
    this._handedGuard  = undefined;
    _clearReplace.call(this);
  };

  const _replaceAttack =
    Game_Actor.prototype.replaceAttackSkillId;

  Game_Actor.prototype.replaceAttackSkillId = function() {
    if (this._handedAttack) return this._handedAttack;

    const w = this.mainHandWeapon();
    if (w) {
      if (w.handedReplaceAttack > 0) {
        return this._handedAttack = w.handedReplaceAttack;
      }
      if (w.handedReplaceAuto > 0) {
        return this._handedAttack = w.handedReplaceAuto;
      }
    }
    return _replaceAttack.call(this);
  };

  const _replaceGuard =
    Game_Actor.prototype.replaceGuardSkillId;

  Game_Actor.prototype.replaceGuardSkillId = function() {
    if (this._handedGuard) return this._handedGuard;

    const w = this.offHandWeapon();
    if (w) {
      if (w.handedReplaceGuard > 0) {
        return this._handedGuard = w.handedReplaceGuard;
      }
      if (w.handedReplaceAuto > 0) {
        return this._handedGuard = w.handedReplaceAuto;
      }
    }
    return _replaceGuard.call(this);
  };

  //===========================================================================
  // Equip Slot Name Override
  //===========================================================================

  const _slotName = Window_EquipSlot.prototype.slotName;

  Window_EquipSlot.prototype.slotName = function(index) {
    if (this._actor && this._actor.equipSlots) {
      const slots = this._actor.equipSlots();

      if (slots[index] === 1) {
        if (index === 0) return "Attack Weapon";
        if (index === 1) return "Guard Weapon";
      }
    }

    return _slotName.call(this, index);
  };

})();