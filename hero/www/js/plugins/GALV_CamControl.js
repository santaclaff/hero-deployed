//-----------------------------------------------------------------------------
//  Galv's Cam Control — SRD Camera Core follow-only compatibility edition
//-----------------------------------------------------------------------------
//  Keeps Galv's delayed player-follow feel without taking ownership of camera
//  targets. SRD_CameraCore remains responsible for all scripted camera work.
//
//  Load below SRD_CameraCore.
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_CamControl = true;

/*:
 * @plugindesc Smooth player-follow camera compatible with SRD Camera Core.
 * @author Galv / HERO compatibility edit
 *
 * @param Follow Speed
 * @desc Higher values make the camera ease toward the player more slowly.
 * @default 800
 *
 * @help
 * This compatibility edition only provides smooth camera follow while the
 * player is the active SRD Camera Core target. It intentionally removes Galv
 * CAM commands and target management so it cannot conflict with SRD's
 * FocusCamera, ResetFocus, ShiftCamera, or camera wait commands.
 *
 * Existing SRD camera commands need no changes. During an SRD scripted focus
 * or camera shift, SRD has complete control; smooth following resumes once
 * the camera is again following the player.
 */

(function() {
    'use strict';

    var params = PluginManager.parameters('GALV_CamControl');
    var followSpeed = Math.max(1, Number(params['Follow Speed'] || 800));

    // SRD's player-scroll handler would otherwise snap the display position
    // before this plugin gets a chance to ease it toward the player.
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        // Intentionally blank. SRD's original handler centers the display
        // immediately while following the player, which would defeat the
        // smooth follow below and can interrupt ResetFocus's transition.
    };

    var _Game_Map_updateScroll = Game_Map.prototype.updateScroll;
    Game_Map.prototype.updateScroll = function() {
        var srdWasMovingCamera = this.isCameraScrolling && this.isCameraScrolling();
        _Game_Map_updateScroll.apply(this, arguments);

        // Never compete with SRD scripted moves, the engine's Scroll Map
        // command, or an SRD focus on an event/follower/map coordinate.
        if (srdWasMovingCamera || this.isScrolling() ||
                !$gameScreen || $gameScreen.focusEvent !== 0) {
            return;
        }

        this.updateSmoothPlayerFollow();
    };

    Game_Map.prototype.updateSmoothPlayerFollow = function() {
        var centerX = Graphics.boxWidth / 2;
        var centerY = Graphics.boxHeight / 2;
        var playerX = $gamePlayer.screenX();
        var playerY = $gamePlayer.screenY();
        var moveX = Math.abs(playerX - centerX) / followSpeed;
        var moveY = Math.abs(playerY - centerY) / followSpeed;

        if (moveX < 0.005) moveX = 0;
        if (moveY < 0.005) moveY = 0;

        if (playerY < centerY) this.scrollUp(moveY);
        else if (playerY > centerY) this.scrollDown(moveY);

        if (playerX < centerX) this.scrollLeft(moveX);
        else if (playerX > centerX) this.scrollRight(moveX);
    };
})();
