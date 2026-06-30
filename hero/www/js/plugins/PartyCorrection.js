(function() {

// ==============================
// MEMBERS FIX (UI cleanup)
// ==============================

const _Game_Party_members = Game_Party.prototype.members;

Game_Party.prototype.members = function() {
    if (SceneManager._scene instanceof Scene_Menu ||
        SceneManager._scene instanceof Scene_Item ||
        SceneManager._scene instanceof Scene_Skill ||
        SceneManager._scene instanceof Scene_Equip ||
        SceneManager._scene instanceof Scene_Status) {
        
        return this.battleMembers();
    }

    return _Game_Party_members.call(this);
};

// ==============================
// SAVE SCREEN PARTY FIX (FINAL)
// ==============================

Window_SaveInfo.prototype.getBattleMembers = function() {
  var party = this._saveContents.party;
  var actors = this._saveContents.actors._data;

  // Try to use battleMembers if it exists (YEP Party System)
  if (party._battleMembers && party._battleMembers.length > 0) {
    return party._battleMembers.filter(id => actors[id]);
  }

  // Fallback: first maxBattleMembers actors
  var result = [];
  var max = party.maxBattleMembers();

  for (var i = 0; i < party._actors.length; i++) {
    var actorId = party._actors[i];
    if (actors[actorId]) {
      result.push(actorId);
    }
    if (result.length >= max) break;
  }

  return result;
};

// ==============================
// DRAW PARTY GRAPHICS
// ==============================

Window_SaveInfo.prototype.drawPartyGraphics = function(dy) {
  if (Yanfly.Param.SaveInfoPartyType === 0) return dy;

  dy = eval(Yanfly.Param.SaveInfoPartyY);

  var members = this.getBattleMembers();
  var length = members.length;
  if (length === 0) return dy;

  var dw = Math.floor(this.contents.width / length);
  var dx = Math.floor(dw / 2);

  for (var i = 0; i < length; ++i) {
    var actorId = members[i];
    var member = this._saveContents.actors._data[actorId];

    if (member) {
      if (Yanfly.Param.SaveInfoPartyType === 1) {
        this.drawCharacter(member.characterName(), member.characterIndex(), dx, dy);
      } else if (Yanfly.Param.SaveInfoPartyType === 2) {
        var fh = Window_Base._faceHeight;
        var fw = Window_Base._faceWidth;
        var fx = dx - Math.floor(Math.min(fh, dw) / 2);
        var dif = Math.floor(Math.max(0, dw - fw) / 2);
        this.drawFace(member.faceName(), member.faceIndex(), fx - dif, dy - fh, dw, fh);
      } else if (Yanfly.Param.SaveInfoPartyType === 3) {
        this.drawSvActor(member, dx, dy);
      }
    }

    dx += dw;
  }

  return dy;
};

// ==============================
// DRAW NAMES
// ==============================

Window_SaveInfo.prototype.drawPartyNames = function(dy) {
  if (!Yanfly.Param.SaveInfoActorName) return dy;

  this.resetFontSettings();
  this.contents.fontSize = Yanfly.Param.SaveInfoActorNameSz;

  var members = this.getBattleMembers();
  var length = members.length;
  if (length === 0) return dy;

  var dw = Math.floor(this.contents.width / length);
  var dx = 0;

  for (var i = 0; i < length; ++i) {
    var actorId = members[i];
    var member = this._saveContents.actors._data[actorId];

    if (member) {
      this.drawText(member._name, dx, dy, dw, 'center');
    }

    dx += dw;
  }

  return dy + this.lineHeight();
};

// ==============================
// DRAW LEVELS
// ==============================

Window_SaveInfo.prototype.drawPartyLevels = function(dy) {
  if (!Yanfly.Param.SaveInfoActorLv) return dy;

  this._drawLevel = true;

  var members = this.getBattleMembers();
  var length = members.length;
  if (length === 0) return dy;

  var dw = Math.floor(this.contents.width / length);
  var dx = 0;
  var fmt = Yanfly.Param.SaveInfoActorLvFmt;

  for (var i = 0; i < length; ++i) {
    var actorId = members[i];
    var member = this._saveContents.actors._data[actorId];

    if (member) {
      var lv = Yanfly.Util.toGroup(member.level);
      var text = fmt.format(TextManager.levelA, TextManager.level, lv);
      var tw = this.textWidthEx(text);
      var dif = Math.floor(Math.max(0, dw - tw) / 2);
      this.drawTextEx(text, dx + dif, dy);
    }

    dx += dw;
  }

  this._drawLevel = false;
  return dy + this.lineHeight();
};

// ==============================
// FORMATION ENABLE FIX
// ==============================

const _addFormationCommand = Window_PartyCommand.prototype.addFormationCommand;

Window_PartyCommand.prototype.addFormationCommand = function() {
    if (!$gameSystem.isShowBattleFormation()) return;

    var index = this.findSymbol('escape');

    // 👇 your custom condition
    var hasReserve = $gameParty._actors.length > $gameParty.battleMembers().length;

    var enabled = $gameSystem.isBattleFormationEnabled() && hasReserve;

    this.addCommandAt(index, TextManager.formation, 'formation', enabled);
};

// ==============================
// FIX: Formation command logic (main menu)
// ==============================

Window_MenuCommand.prototype.isFormationEnabled = function() {
    // enable if more than 1 actor exists in total roster
    return $gameParty._actors.length >= 2;
};

// ==============================
// Remove starting animation
// ==============================

Game_Battler.prototype.performActionStart = function(action) {
    // do nothing
};

// ==============================
// ACTIVE PARTY EXP ONLY
// ==============================

Game_Actor.prototype.shouldDisplayLevelUp = function() {
    return $gameParty.battleMembers().contains(this);
};

const _Game_Actor_changeExp = Game_Actor.prototype.changeExp;

Game_Actor.prototype.changeExp = function(exp, show) {

    if (!$gameParty.battleMembers().contains(this)) {
        return;
    }

    _Game_Actor_changeExp.call(this, exp, show);
};

})();