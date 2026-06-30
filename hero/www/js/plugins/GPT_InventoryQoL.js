/*:
 * @plugindesc Inventory NEW Marker v1.0
 * @author GPT
 */

(function() {

//-----------------------------------------------------------------------------
// Save data
//-----------------------------------------------------------------------------

var _Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    _Game_System_initialize.call(this);
    this._viewedInventoryItems = {};
    this._favoriteItems = {};
};

Game_System.prototype.inventoryKey = function(item) {
    if (DataManager.isWeapon(item)) return "W" + item.id;
    if (DataManager.isArmor(item)) return "A" + item.id;
    return "I" + item.id;
};

Game_System.prototype.isInventoryViewed = function(item) {
    if (!this._viewedInventoryItems)
        this._viewedInventoryItems = {};

    return !!this._viewedInventoryItems[this.inventoryKey(item)];
};

Game_System.prototype.markInventoryViewed = function(item) {
    if (!this._viewedInventoryItems)
        this._viewedInventoryItems = {};

    this._viewedInventoryItems[this.inventoryKey(item)] = true;
};

Game_System.prototype.isFavoriteItem = function(item) {
    if (!this._favoriteItems)
        this._favoriteItems = {};

    return !!this._favoriteItems[this.inventoryKey(item)];
};

Game_System.prototype.toggleFavoriteItem = function(item) {
    if (!this._favoriteItems)
        this._favoriteItems = {};

    var key = this.inventoryKey(item);

    if (this._favoriteItems[key])
        delete this._favoriteItems[key];
    else
        this._favoriteItems[key] = true;
};

//-----------------------------------------------------------------------------
// First acquisition
//-----------------------------------------------------------------------------

var _Game_Party_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {

    var before = item ? this.numItems(item) : 0;

    _Game_Party_gainItem.call(this, item, amount, includeEquip);

    if (!item) return;
    if (amount <= 0) return;

    // only first acquisition
    if (before === 0) {
        if (!$gameSystem._viewedInventoryItems)
            $gameSystem._viewedInventoryItems = {};

        delete $gameSystem._viewedInventoryItems[
            $gameSystem.inventoryKey(item)
        ];
    }
};

//-----------------------------------------------------------------------------
// Clear NEW when highlighted
//-----------------------------------------------------------------------------

var _Window_ItemList_updateHelp =
    Window_ItemList.prototype.updateHelp;

Window_ItemList.prototype.updateHelp = function() {

    if (this._lastViewed &&
        this._lastViewed !== this.item()) {

        $gameSystem.markInventoryViewed(this._lastViewed);
        this.refresh();

        if (this._categoryWindow)
            this._categoryWindow.refresh();
    }

    this._lastViewed = this.item();

    _Window_ItemList_updateHelp.call(this);
};

var _Window_ItemList_deselect =
    Window_ItemList.prototype.deselect;

Window_ItemList.prototype.deselect = function() {

    if (this._lastViewed) {
        $gameSystem.markInventoryViewed(this._lastViewed);
        this.refresh();

        if (this._categoryWindow)
            this._categoryWindow.refresh();
    }

    _Window_ItemList_deselect.call(this);
};

//-----------------------------------------------------------------------------
// Draw yellow dot
//-----------------------------------------------------------------------------

var _Window_ItemList_drawItem =
    Window_ItemList.prototype.drawItem;

Window_ItemList.prototype.drawItem = function(index) {
    _Window_ItemList_drawItem.call(this, index);

    var item = this._data[index];
    if (!item) return;

    var rect = this.itemRect(index);

    // Favorite star
    if ($gameSystem.isFavoriteItem(item)) {

        this.changeTextColor(this.textColor(14));

        this.contents.fontSize = 18;   // default is 28

        this.drawText(
            "★",
            rect.x + rect.width - 60,
            rect.y,
            18,
            "center"
        );

        this.resetFontSettings();
    }

    // NEW dot
    if (!$gameSystem.isInventoryViewed(item)) {
        this.contents.fillCircle(
            rect.x + rect.width - 40,
            rect.y + rect.height / 2,
            4,
            "#ffff00"
        );
    }
};

//-----------------------------------------------------------------------------
// Category dots
//-----------------------------------------------------------------------------

Game_System.prototype.categoryHasNewItems = function(symbol) {

    var list = [];

    if (symbol === "item") {
        list = $gameParty.items().filter(function(item) {
            return item.itypeId === 1;
        });
    } else if (symbol === "weapon") {
        list = $gameParty.weapons();
    } else if (symbol === "armor") {
        list = $gameParty.armors();
    } else if (symbol === "keyItem") {
        list = $gameParty.items().filter(function(item) {
            return item.itypeId === 2;
        });
    } else {
        return false;
    }

    return list.some(function(item) {
        return !$gameSystem.isInventoryViewed(item);
    });
};

var _GPT_drawCategory = Window_ItemCategory.prototype.drawItem;

Window_ItemCategory.prototype.drawItem = function(index) {

    _GPT_drawCategory.call(this, index);

    var symbol = this.commandSymbol(index);

    if (!$gameSystem.categoryHasNewItems(symbol))
        return;

    var rect = this.itemRect(index);

    this.contents.fillCircle(
        rect.x + rect.width - 14,
        rect.y + this.lineHeight() / 2,
        4,
        "#ffff00"
    );

};

var _GPT_createItemWindow = Scene_Item.prototype.createItemWindow;
Scene_Item.prototype.createItemWindow = function() {
    _GPT_createItemWindow.call(this);

    // Give the item window a reference to the category window.
    this._itemWindow._categoryWindow = this._categoryWindow;
};

//-----------------------------------------------------------------------------
// Fave-ing
//-----------------------------------------------------------------------------

Window_ItemActionCommand.prototype.addCustomCommandsA = function() {
    if (!$gameSystem.isFavoriteItem(this._item)) {
        this.addCommand("★ Mark as Favorite", "favorite");
    } else {
        this.addCommand("★ Remove Favorite", "favorite");
    }

};

var _GPT_createActionWindow = Scene_Item.prototype.createActionWindow;
Scene_Item.prototype.createActionWindow = function() {
    _GPT_createActionWindow.call(this);

    this._itemActionWindow.setHandler(
        "favorite",
        this.onFavorite.bind(this)
    );
};

Scene_Item.prototype.onFavorite = function() {
    var item = this.item();

    $gameSystem.toggleFavoriteItem(item);

    this._itemWindow.refresh();
    this._itemActionWindow.setItem(item);
};

//-----------------------------------------------------------------------------
// Inventory sorter
//-----------------------------------------------------------------------------

var _GPT_makeItemList = Window_ItemList.prototype.makeItemList;

Window_ItemList.prototype.makeItemList = function() {
    _GPT_makeItemList.call(this);

    if (!this._data) return;

    this._data.sort(function(a, b) {

        if (!a) return 1;
        if (!b) return -1;

        // Favorites first
        var fa = $gameSystem.isFavoriteItem(a);
        var fb = $gameSystem.isFavoriteItem(b);

        if (fa !== fb)
            return fa ? -1 : 1;

        // Highest rarity first
        var ra = Number(a.meta.itemRarity || 0);
        var rb = Number(b.meta.itemRarity || 0);

        if (ra !== rb)
            return rb - ra;

        return a.id - b.id;
    });
};

})();