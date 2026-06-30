//=============================================================================
// DAN Item Popups (Stable Event-Only Version)
//=============================================================================

/*:
 * @plugindesc Displays item, gold, and EXP popups from event commands only.
 * @author ChatGPT
 */

(function() {

  const POP_W = 280;
  const POP_H = 48;
  const BG_COLOR = 'rgba(0,0,0,0.6)';
  const OFFSET = 20;
  const CORNER = 'bottom-right';
  const MAX_POPUPS = 5;
  const DURATION = 120;
  const DELAY = 30;

  //=============================================================================
  // Game_Temp
  //=============================================================================

  const _Game_Temp_initialize = Game_Temp.prototype.initialize;
  Game_Temp.prototype.initialize = function() {
    _Game_Temp_initialize.call(this);
    this._itemPopupQueue = [];
    this._activePopups = [];
  };

  Game_Temp.prototype.queuePopup = function(data) {
    if (!$gameParty || $gameParty.inBattle()) return;
    this._itemPopupQueue.push(data);
  };

  //=============================================================================
  // Event Command Hooks (ONLY THESE)
  //=============================================================================

  function processItemCommand(interpreter, database) {
    const item = database[interpreter._params[0]];
    const value = interpreter.operateValue(
      interpreter._params[1],
      interpreter._params[2],
      interpreter._params[3]
    );
    return { item, amount: value };
  }

  // Change Items
  const _command126 = Game_Interpreter.prototype.command126;
  Game_Interpreter.prototype.command126 = function() {
    const resultData = processItemCommand(this, $dataItems);
    const result = _command126.call(this);
    if (resultData.amount > 0) {
      $gameTemp.queuePopup({ type: 'item', data: resultData.item, amount: resultData.amount });
    }
    return result;
  };

  // Change Weapons
  const _command127 = Game_Interpreter.prototype.command127;
  Game_Interpreter.prototype.command127 = function() {
    const resultData = processItemCommand(this, $dataWeapons);
    const result = _command127.call(this);
    if (resultData.amount > 0) {
      $gameTemp.queuePopup({ type: 'item', data: resultData.item, amount: resultData.amount });
    }
    return result;
  };

  // Change Armors
  const _command128 = Game_Interpreter.prototype.command128;
  Game_Interpreter.prototype.command128 = function() {
    const resultData = processItemCommand(this, $dataArmors);
    const result = _command128.call(this);
    if (resultData.amount > 0) {
      $gameTemp.queuePopup({ type: 'item', data: resultData.item, amount: resultData.amount });
    }
    return result;
  };

  // Change Gold
  const _command125 = Game_Interpreter.prototype.command125;
  Game_Interpreter.prototype.command125 = function() {
    const value = this.operateValue(this._params[0], this._params[1], this._params[2]);
    const result = _command125.call(this);
    if (value > 0) {
      $gameTemp.queuePopup({ type: 'gold', amount: value });
    }
    return result;
  };

  // Change EXP
  const _command315 = Game_Interpreter.prototype.command315;
  Game_Interpreter.prototype.command315 = function() {
    const actor = this._params[0] === 0 ? null : $gameActors.actor(this._params[1]);
    const value = this.operateValue(this._params[2], this._params[3], this._params[4]);
    const result = _command315.call(this);
    if (value > 0) {
      $gameTemp.queuePopup({ type: 'exp', amount: value });
    }
    return result;
  };

  //=============================================================================
  // Popup Sprite
  //=============================================================================

  function ItemPopupSprite(data, index) {
    Sprite.call(this);
    this._data = data;
    this._duration = DURATION;
    this._index = index;
    this.bitmap = new Bitmap(POP_W, POP_H);
    this.createContents();
  }

  ItemPopupSprite.prototype = Object.create(Sprite.prototype);
  ItemPopupSprite.prototype.constructor = ItemPopupSprite;

  ItemPopupSprite.prototype.createContents = function() {
    const b = this.bitmap;
    b.clear();
    b.fillRect(0, 0, POP_W, POP_H, BG_COLOR);

    let text = '';
    let icon = 0;

    if (this._data.type === 'item') {
      text = this._data.data.name + (this._data.amount > 1 ? ' x' + this._data.amount : '');
      icon = this._data.data.iconIndex;
    }

    if (this._data.type === 'gold') {
      text = this._data.amount + ' Gold';
      icon = 313;
    }

    if (this._data.type === 'exp') {
      text = this._data.amount + ' EXP';
      icon = 82;
    }

    if (icon) {
      const set = ImageManager.loadSystem('IconSet');
      const s = 32;
      b.blt(set, (icon % 16) * s, Math.floor(icon / 16) * s, s, s, 8, 8);
    }

    b.fontSize = 20;
    b.fontSize = 20;

// ==============================
// APPLY RARITY COLOR
// ==============================

let color = '#ffffff';

if (this._data.type === 'item' && this._data.data && this._data.data.meta.itemRarity) {
  const rarity = Number(this._data.data.meta.itemRarity);

  switch(rarity) {
    case 1: color = '#8c8c8c'; break; // F - dark grey
    case 2: color = '#aaffaa'; break; // E - light green
    case 3: color = '#64ff64'; break; // D - green
    case 4: color = '#64b4ff'; break; // C - blue
    case 5: color = '#b478ff'; break; // B - purple
    case 6: color = '#ff8c00'; break; // A - orange
    case 7: color = '#ffd700'; break; // S - gold
  }
}

b.textColor = color;
b.drawText(text, 48, 0, POP_W - 48, POP_H, 'left');
  };

  ItemPopupSprite.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this._duration--;
    this.y -= 0.3;
    if (this._duration < 30) {
      this.opacity = (this._duration / 30) * 255;
    }
  };

  ItemPopupSprite.prototype.isExpired = function() {
    return this._duration <= 0;
  };

  //=============================================================================
  // Scene_Map
  //=============================================================================

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    this.updateItemPopups();
  };

  Scene_Map.prototype.updateItemPopups = function() {
    if (!this._popupContainer) {
      this._popupContainer = new Sprite();
      this.addChild(this._popupContainer);
    }

    const c = this._popupContainer;

    // Remove expired
    for (let i = c.children.length - 1; i >= 0; i--) {
      if (c.children[i].isExpired()) {
        c.removeChild(c.children[i]);
      }
    }

    // Add new
    while ($gameTemp._itemPopupQueue.length && c.children.length < MAX_POPUPS) {
      const data = $gameTemp._itemPopupQueue.shift();
      const sprite = new ItemPopupSprite(data, c.children.length);
      c.addChild(sprite);
    }

    // Position
    c.children.forEach((p, i) => {
      const y = i * (POP_H + 8);
      p.x = Graphics.boxWidth - POP_W - OFFSET;
      p.y = Graphics.boxHeight - POP_H - OFFSET - y;
    });
  };

})();