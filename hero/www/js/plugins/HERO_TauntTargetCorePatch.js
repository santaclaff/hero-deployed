//=============================================================================
// HERO_TauntTargetCorePatch.js
// Compatibility patch for YEP_Taunt + YEP_TargetCore
//=============================================================================

(function() {

    //--------------------------------------------------------------------------
    // Allow "Target + Random Foes" to be affected by Taunt.
    //--------------------------------------------------------------------------

    var _Game_Action_isTauntable = Game_Action.prototype.isTauntable;

    Game_Action.prototype.isTauntable = function() {

        // YEP Target Core:
        // <Target: Target x Random Foes>
        if (this.item().scope === 'TARGET RANDOM FOES') {

            if (this.item().bypassTaunt) return false;

            if (this.isPhysical() &&
                this.subject().ignoreTauntPhysical()) {
                return false;
            }

            if (this.isMagical() &&
                this.subject().ignoreTauntMagical()) {
                return false;
            }

            if (this.isCertainHit() &&
                this.subject().ignoreTauntCertain()) {
                return false;
            }

            return true;
        }

        return _Game_Action_isTauntable.call(this);
    };


    //--------------------------------------------------------------------------
    // Make Target Core's random additional foes respect Taunt.
    //--------------------------------------------------------------------------

    var _Game_Action_getRandomTargets =
        Game_Action.prototype.getRandomTargets;

    Game_Action.prototype.getRandomTargets = function(number, unit) {

        // Only interfere with tauntable enemy-targeting actions.
        if (!this.isTauntable() || unit !== this.opponentsUnit()) {
            return _Game_Action_getRandomTargets.call(this, number, unit);
        }

        var group;

        if (this.isPhysical() &&
            unit.physicalTauntMembers().length > 0) {

            group = unit.physicalTauntMembers();

        } else if (this.isMagical() &&
                   unit.magicalTauntMembers().length > 0) {

            group = unit.magicalTauntMembers();

        } else if (this.isCertainHit() &&
                   unit.certainTauntMembers().length > 0) {

            group = unit.certainTauntMembers();

        } else {

            return _Game_Action_getRandomTargets.call(this, number, unit);
        }


        var targets = [];

        for (var i = 0; i < number; ++i) {
            targets.push(
                group[Math.floor(Math.random() * group.length)]
            );
        }

        return targets;
    };

})();