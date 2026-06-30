//=============================================================================
// EnemyBook_ItemLocal_Minimal.js
//=============================================================================

/*:
 * @plugindesc Item-based Local Enemy Book (Original Layout Preserved)
 *
 * ITEM NOTETAG:
 *   <enemybook: 1,3,5>
 */

(function() {

//=============================================================================
// NOTETAG PROCESSING
//=============================================================================

DataManager.processEnemyBookItemNotetags = function(group) {
    var regex = /<enemybook:\s*([^>]+)>/i;

    for (var i = 1; i < group.length; i++) {
        var obj = group[i];

        if (!obj) continue;

        obj.enemyBookIds = [];

        if (obj.note.match(regex)) {
            var content = RegExp.$1.trim();

            var parts = content.split(',');

            parts.forEach(function(part) {
                part = part.trim();

                // Range format: x to y
                var rangeMatch = part.match(/(\d+)\s*to\s*(\d+)/i);
                if (rangeMatch) {
                    var start = Number(rangeMatch[1]);
                    var end = Number(rangeMatch[2]);

                    if (start > end) {
                        var temp = start;
                        start = end;
                        end = temp;
                    }

                    for (var id = start; id <= end; id++) {
                        obj.enemyBookIds.push(id);
                    }
                }
                // Single number
                else if (/^\d+$/.test(part)) {
                    obj.enemyBookIds.push(Number(part));
                }
            });

            // Remove duplicates (just in case)
            obj.enemyBookIds = obj.enemyBookIds.filter(function(id, index, self) {
                return self.indexOf(id) === index;
            });
        }
    }
};

var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!this._enemyBookLoaded) {
        this.processEnemyBookItemNotetags($dataItems);
        this._enemyBookLoaded = true;
    }
    return true;
};

//=============================================================================
// TEMP STORAGE
//=============================================================================

Game_Temp.prototype.setEnemyBookList = function(list) {
    this._enemyBookList = list;
};

Game_Temp.prototype.getEnemyBookList = function() {
    return this._enemyBookList || [];
};

//=============================================================================
// ITEM HOOK
//=============================================================================

var _Scene_ItemBase_useItem = Scene_ItemBase.prototype.useItem;
Scene_ItemBase.prototype.useItem = function() {
    var item = this.item();
    if (item && item.enemyBookIds && item.enemyBookIds.length > 0) {
        $gameTemp.setEnemyBookList(item.enemyBookIds);
        SceneManager.push(Scene_EnemyBook);
        return;
    }
    _Scene_ItemBase_useItem.call(this);
};

//=============================================================================
// SCENE
//=============================================================================

function Scene_EnemyBook() {
    this.initialize.apply(this, arguments);
}

Scene_EnemyBook.prototype = Object.create(Scene_MenuBase.prototype);
Scene_EnemyBook.prototype.constructor = Scene_EnemyBook;

Scene_EnemyBook.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);

    this._indexWindow = new Window_EnemyBookIndex(0, 0);
    this._indexWindow.setHandler('cancel', this.popScene.bind(this));

    var wy = this._indexWindow.height;
    var ww = Graphics.boxWidth;
    var wh = Graphics.boxHeight - wy;

    this._statusWindow = new Window_EnemyBookStatus(0, wy, ww, wh);

    this.addWindow(this._indexWindow);
    this.addWindow(this._statusWindow);

    this._indexWindow.setStatusWindow(this._statusWindow);
};

//=============================================================================
// INDEX WINDOW (MODIFIED ONLY HERE)
//=============================================================================

function Window_EnemyBookIndex() {
    this.initialize.apply(this, arguments);
}

Window_EnemyBookIndex.prototype = Object.create(Window_Selectable.prototype);
Window_EnemyBookIndex.prototype.constructor = Window_EnemyBookIndex;

Window_EnemyBookIndex.prototype.initialize = function(x, y) {
    var width = Graphics.boxWidth;
    var height = this.fittingHeight(6);
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.select(0);
    this.activate();
};

Window_EnemyBookIndex.prototype.maxCols = function() {
    return 3;
};

Window_EnemyBookIndex.prototype.maxItems = function() {
    return this._list ? this._list.length : 0;
};

Window_EnemyBookIndex.prototype.setStatusWindow = function(statusWindow) {
    this._statusWindow = statusWindow;
    this.updateStatus();
};

Window_EnemyBookIndex.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    this.updateStatus();
};

Window_EnemyBookIndex.prototype.updateStatus = function() {
    if (this._statusWindow) {
        var enemy = this._list[this.index()];
        this._statusWindow.setEnemy(enemy);
    }
};

Window_EnemyBookIndex.prototype.refresh = function() {
    this._list = [];
    var ids = $gameTemp.getEnemyBookList();

    for (var i = 0; i < ids.length; i++) {
        var enemy = $dataEnemies[ids[i]];
        if (enemy && enemy.name && enemy.meta.book !== 'no') {
            this._list.push(enemy);
        }
    }

    this.createContents();
    this.drawAllItems();
};

Window_EnemyBookIndex.prototype.drawItem = function(index) {
    var enemy = this._list[index];
    var rect = this.itemRectForText(index);
    this.drawText(enemy.name, rect.x, rect.y, rect.width);
};

//=============================================================================
// STATUS WINDOW (UNCHANGED FROM ORIGINAL EXCEPT CHECK REMOVED)
//=============================================================================

function Window_EnemyBookStatus() {
    this.initialize.apply(this, arguments);
}

Window_EnemyBookStatus.prototype = Object.create(Window_Base.prototype);
Window_EnemyBookStatus.prototype.constructor = Window_EnemyBookStatus;

Window_EnemyBookStatus.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._enemy = null;
    this._enemySprite = new Sprite();
    this._enemySprite.anchor.x = 0.5;
    this._enemySprite.anchor.y = 0.5;
    this._enemySprite.x = width / 2 - 20;
    this._enemySprite.y = height / 2;
    this.addChildToBack(this._enemySprite);
    this.refresh();
};

Window_EnemyBookStatus.prototype.setEnemy = function(enemy) {
    if (this._enemy !== enemy) {
        this._enemy = enemy;
        this.refresh();
    }
};

Window_EnemyBookStatus.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    if (this._enemySprite.bitmap) {
        var bitmapHeight = this._enemySprite.bitmap.height;
        var contentsHeight = this.contents.height;
        var scale = 1;
        if (bitmapHeight > contentsHeight) {
            scale = contentsHeight / bitmapHeight;
        }
        this._enemySprite.scale.x = scale;
        this._enemySprite.scale.y = scale;
    }
};

Window_EnemyBookStatus.prototype.refresh = function() {
    var enemy = this._enemy;
    var x = 0;
    var y = 0;
    var lineHeight = this.lineHeight();

    this.contents.clear();

    if (!enemy) {
        this._enemySprite.bitmap = null;
        return;
    }

    var name = enemy.battlerName;
    var hue = enemy.battlerHue;
    var bitmap = $gameSystem.isSideView() ?
        ImageManager.loadSvEnemy(name, hue) :
        ImageManager.loadEnemy(name, hue);

    this._enemySprite.bitmap = bitmap;

    this.resetTextColor();
    this.drawText(enemy.name, x, y);

    x = this.textPadding();
    y = lineHeight + this.textPadding();

    for (var i = 0; i < 8; i++) {
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.param(i), x, y, 160);
        this.resetTextColor();
        this.drawText(enemy.params[i], x + 160, y, 60, 'right');
        y += lineHeight;
    }

    var rewardsWidth = 280;
    x = this.contents.width - rewardsWidth;
    y = lineHeight + this.textPadding();

    this.resetTextColor();
    this.drawText(enemy.exp, x, y);
    x += this.textWidth(enemy.exp) + 6;
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.expA, x, y);
    x += this.textWidth(TextManager.expA + '  ');

    this.resetTextColor();
    this.drawText(enemy.gold, x, y);
    x += this.textWidth(enemy.gold) + 6;
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.currencyUnit, x, y);

    x = this.contents.width - rewardsWidth;
    y += lineHeight;

    for (var j = 0; j < enemy.dropItems.length; j++) {
        var di = enemy.dropItems[j];
        if (di.kind > 0) {
            var item = Game_Enemy.prototype.itemObject(di.kind, di.dataId);
            this.drawItemName(item, x, y, rewardsWidth);
            y += lineHeight;
        }
    }

    var descWidth = 480;
    x = this.contents.width - descWidth;
    y = this.textPadding() + lineHeight * 7;
    this.drawTextEx(enemy.meta.desc1, x, y);
    this.drawTextEx(enemy.meta.desc2, x, y + lineHeight);
};

})();