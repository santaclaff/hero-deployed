/*:
 * @plugindesc v1.10 Camera-aware, half-resolution Community Lighting with active/idle redraws.
 * @author Hero
 *
 * @help
 * Place below Community_Lighting and SRD_CameraCore.
 *
 * Renders the lighting canvases at half resolution and scales them back up.
 * This cuts the lighting canvas work and texture uploads to roughly one quarter.
 * While the player and camera are moving it preserves Community Lighting's
 * every-other-frame (30 FPS) update. When both are idle, it redraws at 10 FPS
 * so fire, event lights, and tint transitions remain alive without spending a
 * full 30 redraws per second.
 *
 * It also forces a redraw as a map scene is created or resumed. This prevents
 * a one-frame fully lit screen after a map transfer or when returning from a
 * menu.
 *
 * The Lights Active Radius setting is measured from the centre of the current
 * camera viewport instead of the player. With SRD_CameraCore, lights remain
 * active while the camera is focused away from the player.
 */

var Imported = Imported || {};
Imported.HERO_CommunityLightingPatch = true;

(function() {
  'use strict';

  var LIGHTING_SCALE = 0.5;
  var IDLE_UPDATE_INTERVAL = 6; // 10 FPS in RPG Maker MV's 60 FPS update loop.

  function requestLightmaskRefresh(lightmask) {
    if (lightmask) lightmask._heroLightingRefreshRequested = true;
  }

  function configureHalfResolutionBitmap(bitmap) {
    var width = Math.ceil(bitmap.width * LIGHTING_SCALE);
    var height = Math.ceil(bitmap.height * LIGHTING_SCALE);
    bitmap.resize(width, height);

    // All Community Lighting drawing uses game-pixel coordinates. Scale canvas
    // transforms so its unmodified drawing code lands in the half-size buffer.
    var context = bitmap.context;
    var setTransform = context.setTransform;
    context.setTransform = function(a, b, c, d, e, f) {
      return setTransform.call(context,
        a * LIGHTING_SCALE, b * LIGHTING_SCALE,
        c * LIGHTING_SCALE, d * LIGHTING_SCALE,
        e * LIGHTING_SCALE, f * LIGHTING_SCALE);
    };
    context.resetTransform = function() {
      return setTransform.call(context, LIGHTING_SCALE, 0, 0, LIGHTING_SCALE, 0, 0);
    };
    context.resetTransform();
    bitmap._setDirty();
  }

  function refreshHalfResolutionTransforms(lightmask) {
    var bitmaps = lightmask._maskBitmaps;
    bitmaps.multiply.context.resetTransform();
    bitmaps.additive.context.resetTransform();
  }

  function lightingIsIdle(lightmask) {
    var zoom = $gameScreen ? $gameScreen.zoomScale() : 1;
    var state = [
      $gamePlayer._realX, $gamePlayer._realY, $gamePlayer.direction(),
      $gameMap.displayX(), $gameMap.displayY(), zoom
    ].join('|');
    var isIdle = lightmask._heroLightingLastState === state;
    lightmask._heroLightingLastState = state;
    return isIdle;
  }

  // Community Lighting defines Lightmask inside its own closure. Attach the
  // refresh behavior to each instance as it is created, instead of replacing
  // the third-party plugin's source or its regular 30 FPS update behavior.
  var _Spriteset_Map_createLightmask = Spriteset_Map.prototype.createLightmask;
  Spriteset_Map.prototype.createLightmask = function() {
    _Spriteset_Map_createLightmask.call(this);

    var lightmask = this._lightmask;
    if (!lightmask || lightmask._heroLightingPatchInstalled) return;
    lightmask._heroLightingPatchInstalled = true;
    lightmask._heroLightingRefreshRequested = true;
    configureHalfResolutionBitmap(lightmask._maskBitmaps.multiply);
    configureHalfResolutionBitmap(lightmask._maskBitmaps.additive);

    var _Lightmask_addSprite = lightmask._addSprite;
    lightmask._addSprite = function() {
      _Lightmask_addSprite.apply(this, arguments);
      var sprite = this._sprites[this._sprites.length - 1];
      sprite.scale.set(1 / LIGHTING_SCALE, 1 / LIGHTING_SCALE);
    };

    var _Lightmask_updateMask = lightmask._updateMask;
    lightmask._updateMask = function() {
      refreshHalfResolutionTransforms(this);
      _Lightmask_updateMask.call(this);
    };

    var _Lightmask_update = lightmask.update;
    lightmask.update = function() {
      if (this._heroLightingRefreshRequested) {
        this._heroLightingRefreshRequested = false;
        this._updateMask();
        return;
      }
      if (lightingIsIdle(this) && Graphics.frameCount % IDLE_UPDATE_INTERVAL !== 0) {
        return;
      }
      _Lightmask_update.call(this);
    };
  };

  var _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);
    requestLightmaskRefresh(this._spriteset && this._spriteset._lightmask);
  };

  // Community Lighting uses this helper only for the active-radius check.
  // displayX/displayY are SRD Camera Core's real top-left camera coordinates;
  // adding half the visible map size gives the viewport centre.
  var _CommunityLighting_distance = Community.Lighting.distance;
  Community.Lighting.distance = function(x1, y1, x2, y2) {
    if ($gameMap && $gamePlayer &&
        x1 === $gamePlayer.x && y1 === $gamePlayer.y) {
      x1 = $gameMap.displayX() + $gameMap.screenTileX() / 2;
      y1 = $gameMap.displayY() + $gameMap.screenTileY() / 2;
    }
    return _CommunityLighting_distance.call(this, x1, y1, x2, y2);
  };
})();
