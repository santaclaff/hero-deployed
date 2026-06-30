/*:
 * @plugindesc LUK scaling for HIT/EVA/CRI (1% per 50 LUK)
 */

(function() {

  const rate = 0.01 / 50;

  const _hit = Game_Action.prototype.itemHit;
  Game_Action.prototype.itemHit = function(target) {
    return _hit.call(this, target) + (this.subject().luk * rate);
  };

  const _eva = Game_Action.prototype.itemEva;
  Game_Action.prototype.itemEva = function(target) {

    if (this.isCertainHit()) {
      return 0;
    }

    return _eva.call(this, target) + (target.luk * rate);
  };

  const _cri = Game_Action.prototype.itemCri;
  Game_Action.prototype.itemCri = function(target) {
    return _cri.call(this, target) + (this.subject().luk * rate);
  };

})();