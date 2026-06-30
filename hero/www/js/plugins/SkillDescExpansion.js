/*:
 * @plugindesc v1.2 Skill Power + Elements + Battle Help Fix (stable)
 * @author You
 *
 * @help
 * - 3-line help window for skills and commands
 * - Shows Power + Elements
 * - Attack/Guard show descriptions on hover
 * - Target selection uses 2-line window (no fat UI)
 * - Fixes blank help window on entering target selection
 *
 * Place BELOW:
 * - YEP_EquipBattleSkills
 * - YEP_ElementCore
 */

(function(){

//=============================================================================
// DataManager - Power Notetags
//=============================================================================

const _DM = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function(){
  if(!_DM.call(this)) return false;

  if(!this._skillPowerLoaded){

    for(let i = 1; i < $dataSkills.length; i++){

      let s = $dataSkills[i];
      if(!s) continue;

      s.physicalPowerText = '';
      s.magicalPowerText  = '';

      let phys = s.note.match(/<Physical Power:\s*(.+)>/i);
      let mag  = s.note.match(/<Magical Power:\s*(.+)>/i);

      if(phys) s.physicalPowerText = phys[1];
      if(mag)  s.magicalPowerText  = mag[1];
    }

    this._skillPowerLoaded = true;
  }

  return true;
};

//============================================================================= 
// Help Window - 3 Lines 
//============================================================================= 

const _helpFit = Window_Help.prototype.fittingHeight; Window_Help.prototype.fittingHeight = function(numLines){ if (SceneManager._scene instanceof Scene_Battle || SceneManager._scene instanceof Scene_Skill) { return Window_Base.prototype.fittingHeight.call(this, 3); } return _helpFit.call(this, numLines); };

//=============================================================================
// Append Power + Elements
//=============================================================================

const _setItem = Window_Help.prototype.setItem;

Window_Help.prototype.setItem = function(item){
  _setItem.call(this,item);

  if(!item || !DataManager.isSkill(item)) return;

  let elems = [];

  if(item.damage.elementId > 0) {
    elems.push(item.damage.elementId);
  }

  if(item.multipleElements) {
    elems = elems.concat(item.multipleElements);
  }

  elems = [...new Set(elems)];

  let names = elems
    .map(id => $dataSystem.elements[id])
    .filter(e => e);

  //--------------------------------------------------------------------------
  // Build Power Text
  //--------------------------------------------------------------------------

  let power = '';

  const phys = item.physicalPowerText;
  const mag  = item.magicalPowerText;

  if(phys && mag){
    power = `Total Power: ${phys} (Phys) + ${mag} (Mag)`;
  }
  else if(phys){
    power = `Physical Power: ${phys}`;
  }
  else if(mag){
    power = `Magical Power: ${mag}`;
  }

  let ele = names.length
    ? `Elements: ${names.join(', ')}`
    : '';

let parts = [];

//-----------------------------------------------------------------------------
// Power
//-----------------------------------------------------------------------------

if (power) {
  parts.push(power);
}

//-----------------------------------------------------------------------------
// Elements
//-----------------------------------------------------------------------------

if (ele) {
  parts.push(ele);
}

//-----------------------------------------------------------------------------
// Uses Weapon Effects / Attack States
//-----------------------------------------------------------------------------

// Element ID -1 = Normal Attack Element
// meaning it inherits weapon attack elements/states

if (item.damage.elementId === -1) {
  parts.push("Applies weapon effects");
}

//-----------------------------------------------------------------------------
// Grants Guard State
//-----------------------------------------------------------------------------

const grantsGuard = item.effects.some(effect => {

  // only check Add State effects
  if (effect.code !== Game_Action.EFFECT_ADD_STATE) {
    return false;
  }

  const state = $dataStates[effect.dataId];

  if (!state) return false;

  // check state traits for Special Flag: Guard
  return state.traits.some(trait => {

    return (
      trait.code === Game_BattlerBase.TRAIT_SPECIAL_FLAG &&
      trait.dataId === Game_BattlerBase.FLAG_ID_GUARD
    );

  });

});

if (grantsGuard) {
  parts.push("Counts as Guard");
}

//-----------------------------------------------------------------------------
// Final Line
//-----------------------------------------------------------------------------

let extra = parts.join(" | ");

if (extra) {

  // Change color of metadata line
  extra = '\\C[6]' + extra + '\\C[0]';

  this.setText(this._text + '\n' + extra);
}
};

//=============================================================================
// Attack / Guard Hover Help
//=============================================================================

const _PartyCommand_select =
Window_PartyCommand.prototype.select;

Window_PartyCommand.prototype.select = function(index) {
    _PartyCommand_select.call(this, index);

    const scene = SceneManager._scene;
    if (!scene || !scene._helpWindow) return;

    const symbol = this.currentSymbol();

    let skill = null;

    if (symbol === 'escape') {
        skill = $dataSkills[6];
    }

    if (skill) {
        scene._helpWindow.show();
        scene._helpWindow.setItem(skill);
    } else {
        scene._helpWindow.hide();
    }
};

const _ActorCommand_select = Window_ActorCommand.prototype.select;
Window_ActorCommand.prototype.select = function(index) {
  _ActorCommand_select.call(this, index);

  if (!this._actor) return;

  const scene = SceneManager._scene;
  if (!scene || !scene._helpWindow) return;

  const symbol = this.currentSymbol();

  let skill = null;

  if (symbol === 'attack') {
  skill = $dataSkills[this._actor.attackSkillId()];

} else if (symbol === 'guard') {
  skill = $dataSkills[this._actor.guardSkillId()];

} else if (symbol === 'escape') {
  skill = $dataSkills[6];

} else if (symbol === 'wait') {
  skill = $dataSkills[7];
}

  if (skill) {
    scene._helpWindow.show();
    scene._helpWindow.setItem(skill);
  } else { scene._helpWindow.hide(); }
};

//=============================================================================
// Fix Guard Help Window Stuck
//=============================================================================

const _commandAttack = Scene_Battle.prototype.commandAttack;
Scene_Battle.prototype.commandAttack = function() {
    _commandAttack.call(this);

    if (this._helpWindow) {
        this._helpWindow.clear();
        this._helpWindow.hide();
    }
};

const _commandGuard = Scene_Battle.prototype.commandGuard;
Scene_Battle.prototype.commandGuard = function() {
    _commandGuard.call(this);

    if (this._helpWindow) {
        this._helpWindow.clear();
        this._helpWindow.hide();
    }
};

const _commandWait = Scene_Battle.prototype.commandWait;
Scene_Battle.prototype.commandWait = function() {

    _commandWait.call(this);

    if (this._helpWindow) {
        this._helpWindow.clear();
        this._helpWindow.hide();
    }
};

const _commandEscape = Scene_Battle.prototype.commandEscape;
Scene_Battle.prototype.commandEscape = function() {

    _commandEscape.call(this);

    if (this._helpWindow) {
        this._helpWindow.clear();
        this._helpWindow.hide();
    }
};

//=============================================================================
// Weapon Skills as Locked Slots (FIXED INDEX VERSION)
//=============================================================================

// --- Inject Attack + Guard into visible list ---
const _makeItemList = Window_SkillList.prototype.makeItemList;
Window_SkillList.prototype.makeItemList = function() {
    _makeItemList.call(this);

    if (this._actor &&
        this._stypeId === 'battleSkills' &&
        !$gameParty.inBattle()) {

        const atk = $dataSkills[this._actor.attackSkillId()];
        const grd = $dataSkills[this._actor.guardSkillId()];

        // fake visual entries
        this._data.unshift(grd);
        this._data.unshift(atk);
    }
};

// --- Lock Attack + Guard slots only ---
const _isEnabled = Window_SkillList.prototype.isEnabled;
Window_SkillList.prototype.isEnabled = function(item) {

    if (this._actor &&
        this._stypeId === 'battleSkills' &&
        !$gameParty.inBattle()) {

        const idx = this._data.indexOf(item);

        if (idx === 0 || idx === 1) {
            return false;
        }
    }

    return _isEnabled.call(this, item);
};

//=============================================================================
// FIX SLOT INDEX DESYNC
//=============================================================================

// Helper
Window_SkillList.prototype.realBattleSkillIndex = function(index) {

    if (this._actor &&
        this._stypeId === 'battleSkills' &&
        !$gameParty.inBattle()) {

        return index - 2;
    }

    return index;
};

//-----------------------------------------------------------------------------
// Fix equip preview/stat comparison
//-----------------------------------------------------------------------------

const _updateHelp = Window_SkillEquip.prototype.updateHelp;
Window_SkillEquip.prototype.updateHelp = function() {

    this.setHelpWindowItem(this.item());

    if (this._actor && this._statusWindow && this._listWindow) {

        var actor = JsonEx.makeDeepCopy(this._actor);

        var slotId = this._listWindow.index();

        // FIX OFFSET
        if (this._listWindow.realBattleSkillIndex) {
            slotId = this._listWindow.realBattleSkillIndex(slotId);
        }

        if (this.item() !== null) {
            var skillId = this.item().id;
        } else {
            var skillId = 0;
        }

        actor.equipSkill(skillId, slotId);
        this._statusWindow.setTempActor(actor);
    }
};

//-----------------------------------------------------------------------------
// Fix actual equipping / unequipping
//-----------------------------------------------------------------------------

Scene_Skill.prototype.onSkillEqOk = function() {

    SoundManager.playEquip();

    if (this._skillEquipWindow.item() !== null) {
        var skillId = this._skillEquipWindow.item().id;
    } else {
        var skillId = 0;
    }

    var slotId = this._itemWindow.index();

    // FIX OFFSET
    if (this._itemWindow.realBattleSkillIndex) {
        slotId = this._itemWindow.realBattleSkillIndex(slotId);
    }

    var hpRate = this.actor().hp / Math.max(1, this.actor().mhp);
    var mpRate = this.actor().mp / Math.max(1, this.actor().mmp);

    this.actor().equipSkill(skillId, slotId);

    var max = this.actor().isDead() ? 0 : 1;
    var hpAmount = Math.max(max, parseInt(this.actor().mhp * hpRate));

    this.actor().setHp(hpAmount);
    this.actor().setMp(parseInt(this.actor().mmp * mpRate));

    this.onSkillEqCancel();

    this._statusWindow.refresh();

const slotIndex = slotId + 2;

this._itemWindow.refresh();

// restore visual slot position
this._itemWindow.select(slotIndex);

this._itemWindow.updateHelp();
};

//=============================================================================
// Proper Header Placement (No Overlap)
//=============================================================================

const _itemRect = Window_SkillList.prototype.itemRect;
Window_SkillList.prototype.itemRect = function(index) {
    const rect = _itemRect.call(this, index);

    if ((this._actor &&
    this._stypeId === 'battleSkills' &&
    !$gameParty.inBattle())) {

        const lh = this.lineHeight();

        if (index >= 2) {
            // push real skills BELOW "Equippable Skills"
            rect.y += lh * 3;
        } else {
            // attack / guard sit under "Weapon Skills"
            rect.y += lh * 1;
        }
    }

    return rect;
};

// Draw headers in the empty space we created
const _drawAllItems = Window_SkillList.prototype.drawAllItems;
Window_SkillList.prototype.drawAllItems = function() {
    this.contents.clear();

    if ((this._actor &&
    this._stypeId === 'battleSkills' &&
    !$gameParty.inBattle())) {
        this.drawWeaponHeaders();
    }

    _drawAllItems.call(this);
};

Window_SkillList.prototype.drawWeaponHeaders = function() {
    const lh = this.lineHeight();
    const width = this.contents.width;

    this.changeTextColor(this.systemColor());

    // Row 0
    this.drawText("Weapon Skills", 0, 0, width);

    // Row 3 (after spacer)
    this.drawText("Equippable Skills", 0, lh * 3, width);
};

})();