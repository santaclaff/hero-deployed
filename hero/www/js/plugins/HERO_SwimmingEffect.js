/*:
 * @plugindesc [HERO] Visual swimming/submersion effect for events.
 * @author HERO
 *
 * @param Visual Offset
 * @type number
 * @min 0
 * @default 8
 * @desc Normal downward visual offset for swimming events.
 *
 * @param Drowning Amplitude
 * @type number
 * @min 0
 * @default 6
 * @desc How far a drowning event bobs up and down.
 *
 * @param Drowning Speed
 * @type number
 * @decimals 2
 * @min 0
 * @default 0.08
 * @desc Speed of the drowning bobbing animation.
 *
 * @param Sink Duration
 * @type number
 * @min 1
 * @default 60
 * @desc Number of frames it takes for a drowning event to completely sink.
 *
 * @help
 * ============================================================================
 * HERO Swimming Effect
 * ============================================================================
 *
 * EVENT COMMENTS
 * ============================================================================
 *
 * Put these in an event page's comments:
 *
 * <swim>
 *
 * Makes the event visually swim.
 *
 * <drowning>
 *
 * Makes the event visually bob up and down as though drowning.
 * This also counts as <swim>.
 *
 * Comments are page-specific, unlike event note tags.
 *
 * ============================================================================
 * PLUGIN COMMANDS
 * ============================================================================
 *
 * Drown 3
 *
 * Starts the drowning animation for event 3.
 *
 * Drown this
 *
 * Starts the drowning animation for the event running the command.
 *
 * Once the drowning animation finishes, the event remains completely
 * submerged and will not resurface automatically.
 *
 * ============================================================================
 *
 * The event's actual position, collision, movement, switches, and self
 * switches are unaffected.
 *
 * ============================================================================
 */

(function() {

    'use strict';

    //--------------------------------------------------------------------------
    // Parameters
    //--------------------------------------------------------------------------

    var parameters = PluginManager.parameters('HERO_SwimmingEffect');

    var VISUAL_OFFSET = Number(parameters['Visual Offset'] || 8);
    var DROWNING_AMPLITUDE = Number(parameters['Drowning Amplitude'] || 6);
    var DROWNING_SPEED = Number(parameters['Drowning Speed'] || 0.08);
    var SINK_DURATION = Number(parameters['Sink Duration'] || 60);

    //--------------------------------------------------------------------------
    // Game_Event
    //--------------------------------------------------------------------------

    Game_Event.prototype.heroPageHasTag = function(tag) {

        var page = this.page();

        if (!page || !page.list) {
            return false;
        }

        var regex = new RegExp('<' + tag + '>', 'i');

        for (var i = 0; i < page.list.length; i++) {

            var command = page.list[i];

            // 108 = first line of comment
            // 408 = continuation line of comment
            if (command.code === 108 || command.code === 408) {

                if (regex.test(command.parameters[0] || '')) {
                    return true;
                }
            }
        }

        return false;
    };

    //--------------------------------------------------------------------------
    // Check swimming / drowning
    //--------------------------------------------------------------------------

    function isSwimming(character) {

        if (!(character instanceof Game_Event)) {
            return false;
        }

        // Event page comment.
        if (character.heroPageHasTag('swim')) {
            return true;
        }

        // Original event note support.
        var event = character.event();

        return event &&
               event.note &&
               /<swim>/i.test(event.note);
    }

    function isDrowning(character) {

        if (!(character instanceof Game_Event)) {
            return false;
        }

        // Once actively drowning, stay in the drowning state.
        if (character._heroDrowning) {
            return true;
        }

        // Event page comment.
        if (character.heroPageHasTag('drowning')) {
            return true;
        }

        // Original event note support.
        var event = character.event();

        return event &&
               event.note &&
               /<drowning>/i.test(event.note);
    }

    function isSwimmingOrDrowning(character) {
        return isSwimming(character) || isDrowning(character);
    }

    //--------------------------------------------------------------------------
    // Drowning animation
    //--------------------------------------------------------------------------

    Game_Event.prototype.startHeroDrowning = function() {

        // Already drowned or currently drowning.
        if (this._heroDrowned || this._heroDrowning) {
            return;
        }

        this._heroDrowning = true;
        this._heroDrowningFrame = 0;
    };

    Game_Event.prototype.updateHeroDrowning = function() {

        if (!this._heroDrowning) {
            return;
        }

        this._heroDrowningFrame++;

        if (this._heroDrowningFrame >= SINK_DURATION) {

            this._heroDrowning = false;
            this._heroDrowned = true;
        }
    };

    //--------------------------------------------------------------------------
    // Game_Event update
    //--------------------------------------------------------------------------

    var _Game_Event_update = Game_Event.prototype.update;

    Game_Event.prototype.update = function() {

        _Game_Event_update.call(this);

        this.updateHeroDrowning();
    };

    //--------------------------------------------------------------------------
    // Plugin Command
    //--------------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;

    Game_Interpreter.prototype.pluginCommand = function(command, args) {

        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command.toLowerCase() !== 'drown') {
            return;
        }

        var eventId;

        if (String(args[0]).toLowerCase() === 'this') {
            eventId = this._eventId;
        } else {
            eventId = Number(args[0]);
        }

        if (eventId > 0) {

            var event = $gameMap.event(eventId);

            if (event) {
                event.startHeroDrowning();
            }
        }
    };

    //--------------------------------------------------------------------------
    // Visual offset
    //--------------------------------------------------------------------------

    function getVisualOffset(character, spriteHeight) {

        // Completely drowned.
        if (character._heroDrowned) {
            return spriteHeight + 1;
        }

        var offset = VISUAL_OFFSET;

        // Actual sinking animation.
        if (character._heroDrowning) {

            var progress =
                character._heroDrowningFrame / SINK_DURATION;

            // Gradually sink deeper.
            offset += progress * spriteHeight;
        }

        // Normal <drowning> state.
        else if (isDrowning(character)) {

            // Bob up and down while drowning.
            offset +=
                Math.sin(Graphics.frameCount * DROWNING_SPEED) *
                DROWNING_AMPLITUDE;
        }

        return offset;
    }

    //--------------------------------------------------------------------------
    // Sprite_Character - Position
    //--------------------------------------------------------------------------
    //
    // IMPORTANT:
    // We do NOT modify this.y.
    //
    // The sprite is bottom-anchored. By reducing the displayed frame height,
    // the visible portion naturally moves downward while remaining clipped
    // against the original event position.
    //
    //--------------------------------------------------------------------------

    var _Sprite_Character_updatePosition =
        Sprite_Character.prototype.updatePosition;

    Sprite_Character.prototype.updatePosition = function() {

        _Sprite_Character_updatePosition.call(this);

        // No additional Y offset here.
        //
        // The frame cropping below handles the visual displacement.
    };

    //--------------------------------------------------------------------------
    // Sprite_Character - Frame
    //--------------------------------------------------------------------------

    var _Sprite_Character_updateCharacterFrame =
        Sprite_Character.prototype.updateCharacterFrame;

    Sprite_Character.prototype.updateCharacterFrame = function() {

        // Let MV calculate the normal frame first.
        _Sprite_Character_updateCharacterFrame.call(this);

        var character = this._character;

        if (!(character instanceof Game_Event)) {
            return;
        }

        if (!isSwimmingOrDrowning(character) &&
            !character._heroDrowning &&
            !character._heroDrowned) {

            return;
        }

        var height = this.patternHeight();

        var offset = getVisualOffset(
            character,
            height
        );

        // The offset represents how much of the bottom of the
        // original sprite has gone below the water.
        //
        // Example:
        //   Height = 48
        //   Offset = 8
        //   Visible = 40
        //
        // Because Sprite_Character is bottom-anchored, this causes
        // the visible portion to naturally sit 8 pixels lower.

        var visibleHeight = Math.max(
            0,
            Math.min(height, height - offset)
        );

        this.setFrame(
            this._frame.x,
            this._frame.y,
            this._frame.width,
            Math.floor(visibleHeight)
        );
    };

})();