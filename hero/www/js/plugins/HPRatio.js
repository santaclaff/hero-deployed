/*:
 * @plugindesc Maintains the HP:max HP ratio when max HP changes due to level-up, stat allocation, or equipment.
 * @help This plugin keeps the HP:max HP ratio consistent whenever max HP changes.
 */

(function() {
    // Override addParam to preserve HP ratio when max HP changes through level-up or stat allocation
    var _Game_BattlerBase_addParam = Game_BattlerBase.prototype.addParam;
    Game_BattlerBase.prototype.addParam = function(paramId, value) {
        if (paramId === 0 && value !== 0) { // paramId 0 represents Max HP
            let oldMaxHp = this.mhp;
            let hpRatio = oldMaxHp > 0 ? this.hp / oldMaxHp : 1;

            // Apply the stat change and recalculate max HP
            _Game_BattlerBase_addParam.call(this, paramId, value);

            // Adjust HP to maintain the ratio after max HP has changed
            this._hp = Math.floor(this.mhp * hpRatio);
            this.refresh();
        } else {
            // For all other parameters, just call the original method
            _Game_BattlerBase_addParam.call(this, paramId, value);
        }
    };

    // Override changeEquip to preserve HP ratio when max HP changes due to equipping/unequipping
    var _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function(slotId, item) {
        let oldMaxHp = this.mhp;
        let hpRatio = oldMaxHp > 0 ? this.hp / oldMaxHp : 1;

        // Change the equipment and recalculate max HP
        _Game_Actor_changeEquip.call(this, slotId, item);

        // Adjust HP to maintain the ratio after max HP has changed
        this._hp = Math.floor(this.mhp * hpRatio);
        this.refresh();
    };

    // For good measure, override refresh to cover any missed cases
    var _Game_BattlerBase_refresh = Game_BattlerBase.prototype.refresh;
    Game_BattlerBase.prototype.refresh = function() {
        _Game_BattlerBase_refresh.call(this);
        this._hp = Math.min(this.hp, this.mhp); // Ensure HP never exceeds max HP
    };
})();
