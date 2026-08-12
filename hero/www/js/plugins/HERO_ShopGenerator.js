//=============================================================================
// HERO_ShopGenerator.js
//=============================================================================
/*:
 * @plugindesc v1.00 Generates persistent random shops through Common Event 39.
 * @author HERO
 *
 * @param Shop Variable
 * @type variable
 * @default 40
 *
 * @param Gacha Common Event
 * @type common_event
 * @default 39
 *
 * @param Minimum Items
 * @type number
 * @min 1
 * @default 3
 *
 * @param Maximum Items
 * @type number
 * @min 1
 * @default 5
 * 
 * @param Minimum Price
 * @type number
 * @min 0
 * @default 0
 *
 * @help
 * ============================================================================
 * HERO Shop Generator
 * ============================================================================
 *
 * Shop event script call:
 *
 *     this.openHeroShop();
 *
 * ============================================================================
 * How it works
 * ============================================================================
 *
 * Variable 40 stores the generated shop inventory as JSON.
 *
 * Variable 38 = gacha category
 * Variable 39 = gacha result/database ID
 *
 * Common Event 39 is the universal gacha dispatcher.
 *
 * The shop generator does NOT need to know which gacha is being used.
 * It simply calls Common Event 39, waits for it and the gacha Common Event
 * it calls to finish, then reads Variables 38 and 39.
 *
 * The shop is generated only if Variable 40 is empty.
 *
 * Once generated, Variable 40 contains something like:
 *
 *     [["w",122],["a",167],["s",234],["rw",136]]
 *
 * Leaving the map automatically clears Variable 40.
 *
 * ============================================================================
 * Category codes
 * ============================================================================
 *
 *     w  = weapon
 *     a  = armor
 *     i  = item
 *     s  = item
 *     rw = rare weapon
 *     ra = rare armor
 *     rs = rare item
 *
 * ============================================================================
 * Notes
 * ============================================================================
 *
 * Duplicate shop entries are rejected based on category + database ID.
 *
 * The shop generates between Minimum Items and Maximum Items.
 *
 * A 100-attempt safety limit prevents an infinite loop if a gacha does not
 * have enough unique possible results to fill the requested shop size.
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.HERO_ShopGenerator = true;

(function() {

    //=========================================================================
    // Parameters
    //=========================================================================

    var parameters =
        PluginManager.parameters('HERO_ShopGenerator');

    var SHOP_VARIABLE =
        Number(parameters['Shop Variable'] || 40);

    var GACHA_COMMON_EVENT =
        Number(parameters['Gacha Common Event'] || 39);

    var MIN_ITEMS =
        Number(parameters['Minimum Items'] || 3);

    var MAX_ITEMS =
        Number(parameters['Maximum Items'] || 5);

    var MINIMUM_PRICE =
    Number(parameters['Minimum Price'] || 0);

    //=========================================================================
    // Shop Data
    //=========================================================================

    function getShopData() {

        var value =
            $gameVariables.value(SHOP_VARIABLE);

        if (!value) {
            return [];
        }

        if (Array.isArray(value)) {
            return value;
        }

        try {

            var data = JSON.parse(value);

            if (Array.isArray(data)) {
                return data;
            }

        } catch (e) {
            // Invalid data. Treat as empty.
        }

        return [];
    }

    function saveShopData(data) {

        $gameVariables.setValue(
            SHOP_VARIABLE,
            JSON.stringify(data)
        );
    }

    //=========================================================================
    // Determine Database Group
    //=========================================================================

    function databaseForCategory(category) {

        if (category === 'w' ||
            category === 'rw') {

            return $dataWeapons;
        }

        if (category === 'a' ||
            category === 'ra') {

            return $dataArmors;
        }

        return $dataItems;
    }

    //=========================================================================
    // Convert Stored Shop Data Into MV Shop Goods
    //=========================================================================
    //
    // MV shop goods format:
    //
    //     [type, id, priceType, price]
    //
    // type:
    //     0 = item
    //     1 = weapon
    //     2 = armor
    //
    // priceType:
    //     0 = database price
    //     1 = custom price
    //
    //=========================================================================

    function getShopGoods(data) {

        var goods = [];

        for (var i = 0; i < data.length; i++) {

            var entry = data[i];

            if (!entry ||
                entry.length < 2) {

                continue;
            }

            var category = entry[0];
            var id = Number(entry[1]);

            var database =
                databaseForCategory(category);

            if (!database ||
                !database[id]) {

                continue;
            }

            var type = 0;

            if (category === 'w' ||
                category === 'rw') {

                type = 1;

            } else if (
                category === 'a' ||
                category === 'ra'
            ) {

                type = 2;
            }

            // Use the item's normal database price.
            goods.push([
                type,
                id,
                0,
                0
            ]);
        }

        return goods;
    }

    //=========================================================================
    // Run Gacha Common Event 39
    //=========================================================================
    //
    // CE39 is a dispatcher which calls the appropriate gacha Common Event.
    //
    // We create a temporary interpreter for CE39 and let it run normally.
    // This means if CE39 calls another Common Event, that child interpreter
    // is also handled normally.
    //
    // The callback is only executed once the entire Common Event chain has
    // finished.
    //
    //=========================================================================

    function runGachaCommonEvent(callback) {

        var commonEvent =
            $dataCommonEvents[GACHA_COMMON_EVENT];

        if (!commonEvent) {

            console.error(
                'HERO_ShopGenerator: Common Event ' +
                GACHA_COMMON_EVENT +
                ' does not exist.'
            );

            callback(false);
            return;
        }

        var interpreter =
            new Game_Interpreter();

        interpreter.setup(
            commonEvent.list,
            0
        );

        function updateInterpreter() {

            if (!interpreter.isRunning()) {

                callback(true);
                return;
            }

            interpreter.update();

            /*
             * Use a zero-delay callback instead of recursively updating the
             * interpreter immediately. This prevents us from locking the
             * browser/game thread if a Common Event contains a wait.
             */
            setTimeout(
                updateInterpreter,
                0
            );
        }

        updateInterpreter();
    }

    //=========================================================================
    // Generate Shop
    //=========================================================================

    function generateShop(callback) {

        var range =
            Math.max(
                1,
                MAX_ITEMS - MIN_ITEMS + 1
            );

        var targetCount =
            MIN_ITEMS + Math.randomInt(range);

        var inventory = [];

        var attempts = 0;

        var maxAttempts = 100;

        function rollNext() {

            //===============================================================
            // Shop is full
            //===============================================================

            if (inventory.length >= targetCount) {

                saveShopData(inventory);

                callback(inventory);

                return;
            }

            //===============================================================
            // Safety limit
            //===============================================================

            if (attempts >= maxAttempts) {

                saveShopData(inventory);

                callback(inventory);

                return;
            }

            attempts++;

            //===============================================================
            // Run universal gacha dispatcher
            //===============================================================

            runGachaCommonEvent(function(success) {

                if (!success) {

                    saveShopData(inventory);

                    callback(inventory);

                    return;
                }

                //===========================================================
                // Read gacha result
                //===========================================================

                var category =
    $gameVariables.value(38);

var id =
    Number(
        $gameVariables.value(39)
    );

/*
 * If the gacha didn't produce a valid result, just roll again.
 */
if (!category || !id) {

    rollNext();

    return;
}

/*
 * Determine which database the gacha result belongs to.
 */
var database;

if (category === 'w' || category === 'rw') {
    database = $dataWeapons;

} else if (category === 'a' || category === 'ra') {
    database = $dataArmors;

} else {
    database = $dataItems;
}

var item = database[id];

/*
 * Invalid database entry.
 */
if (!item) {

    rollNext();

    return;
}

/*
 * Don't allow items below the minimum shop price.
 */
if (item.price < MINIMUM_PRICE) {

    rollNext();

    return;
}

                //===========================================================
                // Check duplicate
                //===========================================================

                var duplicate =
                    inventory.some(function(entry) {

                        return entry[0] === category &&
                               Number(entry[1]) === id;

                    });

                if (!duplicate) {

                    inventory.push([
                        category,
                        id
                    ]);
                }

                //===========================================================
                // Next roll
                //===========================================================

                rollNext();

            });
        }

        rollNext();
    }

    //=============================================================================
    // Generate HERO Shop
    //=============================================================================

    Game_Interpreter.prototype.generateHeroShop = function() {

        // Already generated.
        if (getShopData().length > 0) {
            return;
        }

        // Already generating.
        if (this._heroShopGenerating) {
            return;
        }

        this._heroShopGenerating = true;

        var interpreter = this;

        generateShop(function(inventory) {

            interpreter._heroShopGenerating = false;

        });

        /*
        * Pause this event interpreter until generation is complete.
        *
        * The normal RPG Maker event interpreter will repeatedly call this
        * function while _heroShopGenerating is true.
        */
        this.setWaitMode('heroShopGeneration');
    };

    //=============================================================================
    // HERO Shop Generation Wait Mode
    //=============================================================================

    var _Game_Interpreter_updateWaitMode =
        Game_Interpreter.prototype.updateWaitMode;

    Game_Interpreter.prototype.updateWaitMode = function() {

        if (this._waitMode === 'heroShopGeneration') {

            if (this._heroShopGenerating) {
                return true;
            }

            this._waitMode = '';
            return false;
        }

        return _Game_Interpreter_updateWaitMode.call(this);
    };

    //=============================================================================
    // Open HERO Shop
    //=============================================================================

    Game_Interpreter.prototype.openHeroShop = function() {

        var data = getShopData();

        if (data.length <= 0) {
            return;
        }

        var goods = getShopGoods(data);

        if (goods.length <= 0) {
            return;
        }

        SceneManager.push(Scene_Shop);

        SceneManager.prepareNextScene(
            goods,
            false
        );
    };

    //=========================================================================
    // Clear Shop When Leaving Map
    //=========================================================================
    //
    // This means you don't have to add anything to your transfer events.
    //
    // Any actual transfer to a different map clears the shop inventory.
    //
    //=========================================================================

    var _Game_Player_performTransfer =
        Game_Player.prototype.performTransfer;

    Game_Player.prototype.performTransfer =
        function() {

            var oldMapId =
                this._mapId;

            var newMapId =
                this._newMapId;

            _Game_Player_performTransfer.call(this);

            if (oldMapId !== newMapId) {

                $gameVariables.setValue(
                    SHOP_VARIABLE,
                    ''
                );
            }
        };

})();