/*:
 * @plugindesc v1.00 Removes redundant per-character critical flashes from SRD Battle Popup Customizer.
 * @author Hero
 *
 * @help
 * Place below SRD_BattlePopupCustomizer.
 *
 * SRD makes every character in critical damage text flash red for 60 frames,
 * in addition to the separate CRITICAL popup doing the same. On slower mobile
 * renderers, each flashing character requires its own blend-color update.
 *
 * This patch keeps the CRITICAL label and its existing red flash unchanged,
 * while leaving the damage number itself unflashed. Criticals remain visually
 * distinct, but avoid the redundant per-character blend work.
 */

var Imported = Imported || {};
Imported.HERO_BattlePopupPerformancePatch = true;

(function() {
  'use strict';

  var _Sprite_Damage_createDigits = Sprite_Damage.prototype.createDigits;
  Sprite_Damage.prototype.createDigits = function(baseRow, value) {
    var firstNewChild = this.children.length;
    _Sprite_Damage_createDigits.call(this, baseRow, value);

    if (this._result && this._result.critical) {
      for (var i = firstNewChild; i < this.children.length; i++) {
        var sprite = this.children[i];
        sprite.flashDuration = 0;
        sprite.flashColor = [0, 0, 0, 0];
      }
    }
  };
})();
