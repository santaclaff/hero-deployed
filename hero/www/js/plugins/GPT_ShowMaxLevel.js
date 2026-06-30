/*:
 * @plugindesc Shows actor level as Lv X/Y. Use <Hide Max Level> on an actor to display only Lv X.
 * @author ChatGPT
 *
 * @help
 * ============================================================================
 * Actor Notetag
 * ============================================================================
 *
 * <Hide Max Level>
 *
 * Displays:
 * Lv 15
 *
 * instead of:
 * Lv 15/50
 * ============================================================================
 */

(function() {

    //--------------------------------------------------------------------------
    // Notetag Processing
    //--------------------------------------------------------------------------

    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DataManager_isDatabaseLoaded.call(this)) {
            return false;
        }

        if (!DataManager._maxLevelDisplayLoaded) {

            for (var i = 1; i < $dataActors.length; i++) {
                var actor = $dataActors[i];
                if (!actor) continue;

                actor.hideMaxLevel =
                    /<Hide Max Level>/i.test(actor.note);
            }

            DataManager._maxLevelDisplayLoaded = true;
        }

        return true;
    };

    //--------------------------------------------------------------------------
    // Draw Actor Level
    //--------------------------------------------------------------------------

    Window_Base.prototype.drawActorLevel = function(actor, x, y) {

    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.levelA, x, y, 32);

    this.resetTextColor();

    var dataActor = actor.actor();

    if (dataActor.hideMaxLevel) {
        this.drawText(actor.level, x + 30, y, 80, 'left');
    } else {
        this.drawText(
            actor.level + "/" + actor.maxLevel(),
            x + 30,
            y,
            120,
            'left'
        );
    }
};

})();