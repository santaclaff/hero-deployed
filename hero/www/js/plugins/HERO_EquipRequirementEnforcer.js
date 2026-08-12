//=============================================================================
// HERO_EquipRequirementEnforcer.js
//=============================================================================

/*:
 * @plugindesc Enforces YEP Equip Requirements after committed equipment changes.
 * @author HERO
 *
 * @help
 * Requires:
 *   YEP_EquipCore.js
 *   YEP_X_EquipRequirements.js
 *
 * Place BELOW both.
 *
 * When the player commits an equipment change in Scene_Equip, this plugin
 * checks all remaining equipment. Any equipment whose Yanfly Equip
 * Requirements are no longer satisfied is automatically unequipped.
 *
 * Invalid equipment is returned to the party inventory.
 *
 * This intentionally does NOT run during equipment previews/highlighting.
 */

(function() {

    if (!Imported.YEP_EquipCore ||
        !Imported.YEP_X_EquipRequirements) {
        console.warn(
            'HERO_EquipRequirementEnforcer requires ' +
            'YEP_EquipCore and YEP_X_EquipRequirements.'
        );
        return;
    }

    //-------------------------------------------------------------------------
    // Enforce requirements
    //-------------------------------------------------------------------------

    Game_Actor.prototype.heroEnforceEquipRequirements = function() {

        var changed = true;

        while (changed) {

            changed = false;

            var equips = this.equips();

            for (var slotId = 0; slotId < equips.length; ++slotId) {

                var item = equips[slotId];

                if (!item) continue;

                if (!this.meetAllEquipRequirements(item)) {

                    // changeEquip() already knows how to correctly:
                    //
                    // 1. remove the equipped item
                    // 2. return it to inventory
                    // 3. clear the slot
                    //
                    // We are NOT hooking changeEquip(), so this will not
                    // recursively call the enforcer.
                    this.changeEquip(slotId, null);

                    changed = true;

                    // Start again because removing this item could make
                    // another equipped item's requirement invalid.
                    break;
                }
            }
        }
    };


    //-------------------------------------------------------------------------
    // Scene_Equip
    //
    // Only enforce AFTER the player actually confirms an equipment change.
    // Highlighting/previewing equipment does not call this extension.
    //-------------------------------------------------------------------------

    var HERO_EqReq_SceneEquip_onItemOk =
        Scene_Equip.prototype.onItemOk;

    Scene_Equip.prototype.onItemOk = function() {

        // Let RPG Maker/Yanfly perform the actual equipment transaction first.
        HERO_EqReq_SceneEquip_onItemOk.call(this);

        // Now enforce dependencies on the REAL actor.
        this.actor().heroEnforceEquipRequirements();

        // Refresh the windows because dependent equipment may have disappeared.
        this._slotWindow.refresh();
        this._itemWindow.refresh();

        if (this._statusWindow) {
            this._statusWindow.refresh();
        }

        if (this._compareWindow) {
            this._compareWindow.refresh();
        }
    };

})();