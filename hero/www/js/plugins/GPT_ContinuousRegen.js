/*:
 * @plugindesc v1.1 Implements continuous (fractional) HP/MP regeneration and tracking with integer display + popup compatibility.
 * @author ChatGPT
 *
 * @help
 * This plugin tracks HP and MP internally as floating-point values,
 * applies fractional regen each turn, and displays integer values.
 *
 * Compatible with damage popup plugins because regeneration uses
 * gainHp/gainMp internally.
 *
 * No plugin commands.
 */

(function() {

    // =========================================================================
    // Initialize true HP/MP
    // =========================================================================

    var _Game_Battler_initMembers = Game_Battler.prototype.initMembers;
    Game_Battler.prototype.initMembers = function() {
        _Game_Battler_initMembers.call(this);
        this._trueHp = null;
        this._trueMp = null;
    };

    // =========================================================================
    // Accessors
    // =========================================================================

    Game_Battler.prototype.trueHp = function() {
        if (this._trueHp === null) this._trueHp = this.hp;
        return this._trueHp;
    };

    Game_Battler.prototype.trueMp = function() {
        if (this._trueMp === null) this._trueMp = this.mp;
        return this._trueMp;
    };

    // =========================================================================
    // Sync true values when HP/MP directly set
    // =========================================================================

    var _Game_Battler_setHp = Game_Battler.prototype.setHp;
    Game_Battler.prototype.setHp = function(hp) {
        _Game_Battler_setHp.call(this, hp);
        this._trueHp = this.hp;
    };

    var _Game_Battler_setMp = Game_Battler.prototype.setMp;
    Game_Battler.prototype.setMp = function(mp) {
        _Game_Battler_setMp.call(this, mp);
        this._trueMp = this.mp;
    };

    // =========================================================================
    // gainHp / gainMp
    // =========================================================================

    var _Game_Battler_gainHp = Game_Battler.prototype.gainHp;
    Game_Battler.prototype.gainHp = function(value) {

        this._trueHp = this.trueHp() + value;
        this._trueHp = Math.max(0, Math.min(this.mhp, this._trueHp));

        var intHp = Math.floor(this._trueHp);

        _Game_Battler_gainHp.call(this, intHp - this.hp);
    };

    var _Game_Battler_gainMp = Game_Battler.prototype.gainMp;
    Game_Battler.prototype.gainMp = function(value) {

        this._trueMp = this.trueMp() + value;
        this._trueMp = Math.max(0, Math.min(this.mmp, this._trueMp));

        var intMp = Math.floor(this._trueMp);

        _Game_Battler_gainMp.call(this, intMp - this.mp);
    };

    // =========================================================================
    // Regeneration
    // =========================================================================

    Game_Battler.prototype.regenerateHp = function() {

    var rate = this.traitsSum(Game_BattlerBase.TRAIT_REGEN_HP);
    var value = this.mhp * rate;

    this._trueHp = this.trueHp() + value;
    this._trueHp = Math.max(0, Math.min(this.mhp, this._trueHp));

    var intHp = Math.floor(this._trueHp);
    var delta = intHp - this.hp;

    if (delta !== 0) {

        this.clearResult();

        this.gainHp(delta);

        this.result().hpAffected = true;

        this.startDamagePopup();
    }
};

    Game_Battler.prototype.regenerateMp = function() {

    var rate = this.traitsSum(Game_BattlerBase.TRAIT_REGEN_MP);
    var value = this.mmp * rate;

    this._trueMp = this.trueMp() + value;
    this._trueMp = Math.max(0, Math.min(this.mmp, this._trueMp));

    var intMp = Math.floor(this._trueMp);
    var delta = intMp - this.mp;

    if (delta !== 0) {

        this.clearResult();

        this.gainMp(delta);

        this.startDamagePopup();
    }
};

})();