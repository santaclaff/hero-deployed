/*:
 * @plugindesc Horizontally mirror sideview actor sprites etc.
 * @author Caethyril
 * @help Terms of use:
 *    Free to use and/or modify~
 */

(function(alias) {
    // Horizontally mirror movement offsets
    Sprite_Actor.prototype.startMove = function(x, y, duration) {
        alias.call(this, -x, y, duration);
    };
})(Sprite_Actor.prototype.startMove);

(function(alias) {
    // Mirror X value when setting actor home position
    Sprite_Actor.prototype.setHome = function(x, y) {
        alias.call(this, Graphics.boxWidth - x, y);
    };
})(Sprite_Actor.prototype.setHome);

(function(alias) {
    // Horizontally mirror actor battler sprite immediately after creation
    Sprite_Actor.prototype.createMainSprite = function() {
        alias.apply(this, arguments);
        this._mainSprite.scale.x *= -1;
    };
})(Sprite_Actor.prototype.createMainSprite);

(function(alias) {
    // Horizontally mirror/reposition weapon sprite immediately after creation
    Sprite_Weapon.prototype.initMembers = function() {
        alias.apply(this, arguments);
        this.scale.x *= -1;
        this.x *= -1;
    };
})(Sprite_Weapon.prototype.initMembers);