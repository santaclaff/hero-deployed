//=============================================================================
// Recipe New Marker
//=============================================================================

var Imported = Imported || {};
Imported.RecipeNewMarker = true;

//=============================================================================
// Recipe Unlock Gab
//=============================================================================

var RNM_RECIPE_GAB_TEXT = "\\i[193] New crafting recipes unlocked!";
var RNM_RECIPE_GAB_SOUND = "Item1";   // audio/se/Item3.ogg

//-----------------------------------------------------------------------------
// Game_System
//-----------------------------------------------------------------------------

var _RNM_GameSystem_init = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    _RNM_GameSystem_init.call(this);
    this._viewedSynthesisRecipes = {};
};

Game_System.prototype.viewedRecipeKey = function(item) {
    if (!item) return "";
    
    var prefix = "I";
    if (DataManager.isWeapon(item)) prefix = "W";
    if (DataManager.isArmor(item)) prefix = "A";
    
    return prefix + item.id;
};

Game_System.prototype.markRecipeViewed = function(item) {
    if (!this._viewedSynthesisRecipes) {
        this._viewedSynthesisRecipes = {};
    }
    this._viewedSynthesisRecipes[this.viewedRecipeKey(item)] = true;
};

Game_System.prototype.isRecipeViewed = function(item) {
    if (!item) return true;
    
    if (!this._viewedSynthesisRecipes) {
        this._viewedSynthesisRecipes = {};
    }
    
    return !!this._viewedSynthesisRecipes[this.viewedRecipeKey(item)];
};

//-----------------------------------------------------------------------------
// Window_SynthesisList
//-----------------------------------------------------------------------------

var _RNM_updateHelp = Window_SynthesisList.prototype.updateHelp;
Window_SynthesisList.prototype.updateHelp = function() {

    if (this._lastViewedRecipe &&
        this._lastViewedRecipe !== this.item()) {

        $gameSystem.markRecipeViewed(this._lastViewedRecipe);

        this.refresh();

        // Refresh the category list too.
        if (this._commandWindow) {
            this._commandWindow.refresh();
        }
    }

    this._lastViewedRecipe = this.item();

    _RNM_updateHelp.call(this);
};

var _RNM_deselect = Window_SynthesisList.prototype.deselect;
Window_SynthesisList.prototype.deselect = function() {

    if (this._lastViewedRecipe) {
        $gameSystem.markRecipeViewed(this._lastViewedRecipe);

        this.refresh();

        if (this._commandWindow) {
            this._commandWindow.refresh();
        }
    }

    _RNM_deselect.call(this);
};

//-----------------------------------------------------------------------------
// Draw NEW marker
//-----------------------------------------------------------------------------

var _RNM_drawItem = Window_SynthesisList.prototype.drawItem;
Window_SynthesisList.prototype.drawItem = function(index) {
    _RNM_drawItem.call(this, index);

    var item = this._data[index];
    if (!item) return;
    if ($gameSystem.isRecipeViewed(item)) return;

    var rect = this.itemRect(index);

    // Position immediately left of the quantity display.
    var x = rect.x + rect.width - 45;
    var y = rect.y + rect.height / 2;

    this.contents.fillCircle(x, y, 4, "#ffff00");
};

//-----------------------------------------------------------------------------
// MV compatibility (fillCircle)
//-----------------------------------------------------------------------------

if (!Bitmap.prototype.fillCircle) {
    Bitmap.prototype.fillCircle = function(x, y, radius, color) {
        var context = this._context;
        context.save();
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
        this._setDirty();
    };
}

//-----------------------------------------------------------------------------
// NEW marker on Item/Weapon/Armor categories
//-----------------------------------------------------------------------------

Window_SynthesisCommand.prototype.categoryHasNewRecipe = function(symbol) {
    var list = [];

    if (symbol === 'item') {
        list = Scene_Synthesis.availableItems();
    } else if (symbol === 'weapon') {
        list = Scene_Synthesis.availableWeapons();
    } else if (symbol === 'armor') {
        list = Scene_Synthesis.availableArmors();
    } else {
        return false;
    }

    for (var i = 0; i < list.length; i++) {
        if (!$gameSystem.isRecipeViewed(list[i])) {
            return true;
        }
    }

    return false;
};

var _RNM_WindowSynthesisCommand_drawItem =
    Window_SynthesisCommand.prototype.drawItem;

Window_SynthesisCommand.prototype.drawItem = function(index) {
    _RNM_WindowSynthesisCommand_drawItem.call(this, index);

    var symbol = this.commandSymbol(index);
    if (!this.categoryHasNewRecipe(symbol)) return;

    var rect = this.itemRect(index);

    // Draw the same yellow dot used for recipes.
    var x = rect.x + rect.width - 18;
    var y = rect.y + rect.height / 2;

    this.contents.fillCircle(x, y, 4, "#ffff00");
};

//-----------------------------------------------------------------------------
// Recipe Unlock Gab
//-----------------------------------------------------------------------------

var _RNM_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {

    var oldAmount = item ? this.numItems(item) : 0;

    _RNM_gainItem.call(this, item, amount, includeEquip);

    if (!item) return;
    if (amount <= 0) return;

    // Only trigger the first time the player acquires this item.
    if (oldAmount > 0) return;

    var unlocksRecipes =
        (item.recipeItem && item.recipeItem.length > 0) ||
        (item.recipeWeapon && item.recipeWeapon.length > 0) ||
        (item.recipeArmor && item.recipeArmor.length > 0);

    if (!unlocksRecipes) return;

    var scene = SceneManager._scene;
    if (!scene || !scene._gabWindow) return;

    var gabData = [
        RNM_RECIPE_GAB_TEXT,
        "none",                 // graphic type
        "",                     // graphic name
        0,                      // graphic index
        RNM_RECIPE_GAB_SOUND,   // sound
        0                       // switch
    ];

    scene.startGabWindow(gabData);
};

//-----------------------------------------------------------------------------
// Sort recipes by Rarity (Descending) then by ID
//-----------------------------------------------------------------------------

var _RNM_sortList = Scene_Synthesis.sortList;
Scene_Synthesis.sortList = function(list) {
    list.sort(function(a, b) {
        // Get rarity (default to 0 if not set)
        var rarityA = a.meta && a.meta.itemRarity ? Number(a.meta.itemRarity) : 0;
        var rarityB = b.meta && b.meta.itemRarity ? Number(b.meta.itemRarity) : 0;

        // Higher rarity first (S=7, A=6, B=5, etc.)
        if (rarityA !== rarityB) {
            return rarityB - rarityA;
        }

        // If same rarity, fallback to ID sorting (like the original)
        if (a.id !== b.id) {
            return a.id - b.id;
        }
        return 0;
    });
    return list;
};