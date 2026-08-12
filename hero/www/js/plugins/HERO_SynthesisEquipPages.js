//=============================================================================
// HERO_SynthesisEquipPages.js
//=============================================================================

var Imported = Imported || {};
Imported.HERO_SynthesisEquipPages = true;

var HERO = HERO || {};
HERO.SynthesisEquipPages = HERO.SynthesisEquipPages || {};

/*:
 * @plugindesc v1.00 Adds equipment stat/comparison pages to YEP Item Synthesis.
 * @author HERO
 *
 * @help
 * ============================================================================
 * HERO - Synthesis Equipment Pages
 * ============================================================================
 *
 * Requires:
 *   YEP_ItemSynthesis
 *   YEP_ShopMenuCore
 *
 * Recommended:
 *   HERO_ShopMultiSlotCompare
 *
 * PLACE BELOW ALL OF THE ABOVE.
 *
 * When selecting a weapon or armor in Item Synthesis, the Ingredients
 * window gains multiple pages:
 *
 *   Ingredients
 *   Item Stats
 *   Actor 1
 *   Actor 2
 *   Actor 3
 *   ...
 *
 * Press LEFT / RIGHT while the synthesis list is active to switch pages.
 *
 * Actor pages show the stat changes that would result from equipping the
 * synthesized item.
 *
 * If HERO_ShopMultiSlotCompare is installed, its multi-slot and two-handed
 * comparison logic is reused.
 *
 * Normal items only display the Ingredients page.
 *
 * No plugin commands or parameters.
 */

//=============================================================================
// Window_SynthesisIngredients
//=============================================================================

var HERO_SEP_initialize =
    Window_SynthesisIngredients.prototype.initialize;

Window_SynthesisIngredients.prototype.initialize = function(wx, wy, ww, wh) {
    HERO_SEP_initialize.call(this, wx, wy, ww, wh);
    this._pageIndex = 0;
};


//-----------------------------------------------------------------------------
// Item
//-----------------------------------------------------------------------------

Window_SynthesisIngredients.prototype.setItem = function(item) {
    this._item = item;

    // Preserve the current page whenever possible.
    // If the new item doesn't have that page, fall back to Ingredients.
    if (this._pageIndex >= this.heroMaxPages()) {
        this._pageIndex = 0;
    }

    this.refresh();
};


//-----------------------------------------------------------------------------
// Equipment check
//-----------------------------------------------------------------------------

Window_SynthesisIngredients.prototype.heroIsEquipItem = function() {
    if (!this._item) return false;

    return DataManager.isWeapon(this._item) ||
           DataManager.isArmor(this._item);
};


//-----------------------------------------------------------------------------
// Pages
//
// 0 = Ingredients
// 1 = Item Stats
// 2+ = Party actors
//-----------------------------------------------------------------------------

Window_SynthesisIngredients.prototype.heroMaxPages = function() {
    if (!this.heroIsEquipItem()) {
        return 1;
    }

    return 2 + $gameParty.battleMembers().length;
};


Window_SynthesisIngredients.prototype.heroCurrentActor = function() {
    var actorIndex = this._pageIndex - 2;

    if (actorIndex < 0) return null;

    return $gameParty.battleMembers()[actorIndex];
};


//-----------------------------------------------------------------------------
// Page switching
//-----------------------------------------------------------------------------

Window_SynthesisIngredients.prototype.heroPageLeft = function() {
    var max = this.heroMaxPages();

    if (max <= 1) return;

    this._pageIndex--;

    if (this._pageIndex < 0) {
        this._pageIndex = max - 1;
    }

    SoundManager.playCursor();
    this.refresh();
};


Window_SynthesisIngredients.prototype.heroPageRight = function() {
    var max = this.heroMaxPages();

    if (max <= 1) return;

    this._pageIndex++;

    if (this._pageIndex >= max) {
        this._pageIndex = 0;
    }

    SoundManager.playCursor();
    this.refresh();
};


//-----------------------------------------------------------------------------
// Refresh
//-----------------------------------------------------------------------------

Window_SynthesisIngredients.prototype.refresh = function(item) {

    // YEP Item Synthesis normally calls refresh(item).
    //
    // Do NOT reset the page just because the selected recipe changed.
    // Page position belongs to the window, not to an individual item.
    if (item !== undefined) {
        this._item = item;
    }

    this.contents.clear();

    if (!this._item) return;

    this.resetFontSettings();
    this.resetTextColor();

    // If the current page doesn't exist for the newly selected item,
    // fall back to Ingredients.
    //
    // Example:
    // Weapon Page 2 -> another Weapon = remain on Page 2
    // Weapon Page 2 -> normal Item    = return to Page 1
    if (this._pageIndex >= this.heroMaxPages()) {
        this._pageIndex = 0;
    }

    if (this._pageIndex === 0) {
        this.drawItemIngredients(this._item, this.lineHeight());

    } else if (this._pageIndex === 1) {
        this.heroDrawItemStats();

    } else {
        this.heroDrawActorComparison();
    }
};


//=============================================================================
// Page Header
//=============================================================================

Window_SynthesisIngredients.prototype.heroDrawPageHeader = function(text) {
    var ww = this.contents.width;

    this.changeTextColor(this.systemColor());

    this.drawText('<<', 0, 0, ww, 'left');
    this.drawText(text, 0, 0, ww, 'center');
    this.drawText('>>', 0, 0, ww, 'right');

    this.resetTextColor();
};


//=============================================================================
// Item Stats Page
//=============================================================================

Window_SynthesisIngredients.prototype.heroDrawItemStats = function() {
    var item = this._item;

    this.heroDrawPageHeader('Item Stats');
    this.contents.fontSize = this.heroStatFontSize();

    var startY = this.lineHeight() * 2;

    for (var i = 0; i < 8; ++i) {

        var rect = this.heroStatRect(i, startY);

        this.heroDrawDarkRect(
            rect.x,
            rect.y,
            rect.width,
            rect.height
        );

        var dx = rect.x + this.textPadding();
        var dw = rect.width - this.textPadding() * 2;

        // Parameter name
        this.changeTextColor(this.systemColor());
        this.drawText(
            TextManager.param(i),
            dx,
            rect.y,
            dw
        );

        // Parameter value
        var value = item.params[i];

        this.changePaintOpacity(value !== 0);
        this.changeTextColor(this.paramchangeTextColor(value));

        var text = Yanfly.Util.toGroup(value);

        if (value > 0) {
            text = '+' + text;
        }

        this.drawText(
            text,
            dx,
            rect.y,
            dw,
            'right'
        );

        this.changePaintOpacity(true);
    }

    this.resetTextColor();
};


//=============================================================================
// Actor Comparison Page
//=============================================================================

Window_SynthesisIngredients.prototype.heroDrawActorComparison = function() {
    var actor = this.heroCurrentActor();

    if (!actor) return;

    this.heroDrawPageHeader(actor.name());
    this.contents.fontSize = this.heroStatFontSize();

    var startY = this.lineHeight() * 2;
    var canEquip = actor.canEquip(this._item);

    for (var i = 0; i < 8; ++i) {

        var rect = this.heroStatRect(i, startY);

        this.heroDrawDarkRect(
            rect.x,
            rect.y,
            rect.width,
            rect.height
        );

        var dx = rect.x + this.textPadding();
        var dw = rect.width - this.textPadding() * 2;

        // Parameter name
        this.changePaintOpacity(true);
        this.changeTextColor(this.systemColor());

        this.drawText(
            TextManager.param(i),
            dx,
            rect.y,
            dw
        );

        if (!canEquip) {

            this.changePaintOpacity(false);
            this.resetTextColor();

            this.drawText(
                '-',
                dx,
                rect.y,
                dw,
                'right'
            );

        } else {

            this.heroDrawActorParamChange(
                actor,
                i,
                dx,
                rect.y,
                dw
            );
        }
    }

    this.changePaintOpacity(true);
    this.resetTextColor();
};


//=============================================================================
// Stat Comparison
//=============================================================================

Window_SynthesisIngredients.prototype.heroDrawActorParamChange =
function(actor, paramId, x, y, width) {

    var range = this.heroParamChangeRange(
        actor,
        this._item,
        paramId
    );

    var zero = range.min === 0 && range.max === 0;

    this.changePaintOpacity(!zero);

    this.heroSetRangeColor(range);

    var text = this.heroFormatParamRange(range);

    this.drawText(
        text,
        x,
        y,
        width,
        'right'
    );

    this.changePaintOpacity(true);
};


//=============================================================================
// Multi-Slot Comparison
//=============================================================================

Window_SynthesisIngredients.prototype.heroCompatibleEquips =
function(actor, item) {

    var slots = actor.equipSlots();
    var equips = actor.equips();
    var result = [];

    for (var i = 0; i < slots.length; ++i) {

        if (slots[i] === item.etypeId) {
            result.push(equips[i] || null);
        }
    }

    return result;
};


Window_SynthesisIngredients.prototype.heroParamChangeRange =
function(actor, item, paramId) {

    //-------------------------------------------------------------------------
    // If HERO_ShopMultiSlotCompare exists, directly use its tested logic.
    //-------------------------------------------------------------------------

    if (Imported.HERO_ShopMultiSlotCompare &&
        Window_ShopStatus.prototype.heroParamChangeRange) {

        return Window_ShopStatus.prototype.heroParamChangeRange.call(
            this,
            actor,
            item,
            paramId
        );
    }


    //-------------------------------------------------------------------------
    // Fallback comparison if that plugin isn't installed.
    //-------------------------------------------------------------------------

    var equips = this.heroCompatibleEquips(actor, item);

    if (equips.length <= 0) {

        return {
            min: item.params[paramId],
            max: item.params[paramId]
        };
    }

    var min = Infinity;
    var max = -Infinity;

    for (var i = 0; i < equips.length; ++i) {

        var oldItem = equips[i];

        var oldValue =
            oldItem ? oldItem.params[paramId] : 0;

        var change =
            item.params[paramId] - oldValue;

        min = Math.min(min, change);
        max = Math.max(max, change);
    }

    return {
        min: min,
        max: max
    };
};


Window_SynthesisIngredients.prototype.heroFormatParamChange =
function(value) {

    var text = Yanfly.Util.toGroup(value);

    if (value > 0) {
        text = '+' + text;
    }

    return text;
};


Window_SynthesisIngredients.prototype.heroFormatParamRange =
function(range) {

    if (range.min === range.max) {
        return this.heroFormatParamChange(range.min);
    }

    return this.heroFormatParamChange(range.min) +
           '~' +
           this.heroFormatParamChange(range.max);
};


Window_SynthesisIngredients.prototype.heroSetRangeColor =
function(range) {

    if (range.min > 0) {

        this.changeTextColor(
            this.paramchangeTextColor(1)
        );

    } else if (range.max < 0) {

        this.changeTextColor(
            this.paramchangeTextColor(-1)
        );

    } else {

        this.resetTextColor();
    }
};


//=============================================================================
// Drawing Helpers
//=============================================================================

Window_SynthesisIngredients.prototype.heroStatRect =
function(index, startY) {

    var rect = new Rectangle();

    rect.width =
        Math.floor(this.contents.width / 2);

    rect.height =
        this.lineHeight();

    rect.x =
        index % 2 === 0 ? 0 : rect.width;

    rect.y =
        startY +
        Math.floor(index / 2) * this.lineHeight();

    return rect;
};


Window_SynthesisIngredients.prototype.heroDrawDarkRect =
function(x, y, width, height) {

    var color = this.gaugeBackColor();

    this.changePaintOpacity(false);

    this.contents.fillRect(
        x + 1,
        y + 1,
        width - 2,
        height - 2,
        color
    );

    this.changePaintOpacity(true);
};


//=============================================================================
// Window_SynthesisList
//=============================================================================
//
// The LIST remains the active window. This is important because we don't
// actually want the Ingredients window to become selectable.
//
// We simply intercept LEFT / RIGHT while browsing equipment recipes.
//=============================================================================

var HERO_SEP_listUpdate =
    Window_SynthesisList.prototype.update;

Window_SynthesisList.prototype.update = function() {

    HERO_SEP_listUpdate.call(this);

    if (!this.active) return;
    if (!this._ingredients) return;
    if (!this._ingredients.heroIsEquipItem()) return;

    if (Input.isTriggered('left')) {

        this._ingredients.heroPageLeft();

    } else if (Input.isTriggered('right')) {

        this._ingredients.heroPageRight();
    }
};

Window_SynthesisIngredients.prototype.drawItemIngredients = function(item, wy) {
    var ww = this.contents.width;

    // Same pagination header used by the other pages.
    if (this.heroMaxPages() > 1) {
        this.heroDrawPageHeader(Yanfly.Param.ISIngredientsList);
    } else {
        this.changeTextColor(this.systemColor());
        this.drawText(
            Yanfly.Param.ISIngredientsList,
            0,
            0,
            ww,
            'center'
        );
        this.resetTextColor();
    }

    for (var i = 0; i < item.synthIngredients.length; ++i) {
        wy = this.drawItemDetails(i, wy);

        if (wy + this.lineHeight() > this.contents.height) {
            break;
        }
    }

    this.drawItemSynthCost(item, wy);
};

Window_SynthesisIngredients.prototype.heroStatFontSize = function() {
    return Math.max(16, this.standardFontSize() - 4);
};


//=============================================================================
// End of File
//=============================================================================