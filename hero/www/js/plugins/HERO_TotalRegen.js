//=============================================================================
// HERO_TotalRegen.js
//=============================================================================

/*:
 * @plugindesc Adds totalHpRegen() and totalMpRegen() methods that combine
 * Flat Regen Stats with YEP Extended DoT/Regeneration effects.
 * @author HERO
 *
 * @help
 * ============================================================================
 * Usage
 * ============================================================================
 *
 * battler.totalHpRegen()
 * battler.totalMpRegen()
 *
 * Examples:
 *
 *   a.totalHpRegen()
 *   b.totalHpRegen()
 *   actor.totalMpRegen()
 *
 * The returned value represents the battler's current expected net flat
 * HP/MP regeneration per regeneration tick.
 *
 * Positive values = healing/restoration
 * Negative values = damage/drain
 *
 * This includes:
 *
 * - flatHpRegen() / flatMpRegen()
 * - Active Extended DoT/Regen state formulas
 * - Elemental rates for Extended DoT/Regen effects
 *
 * This does NOT include:
 *
 * - Variance
 * - Default percentage HP/MP regeneration (HRG/MRG)
 *
 * Extended DoT formulas are evaluated read-only. No HP or MP is actually
 * changed by calling these methods.
 *
 * Place this plugin below:
 *
 * - YEP_BuffsStatesCore.js
 * - YEP_X_ExtDoT.js
 * - Flat_Regen_Stats.js
 *
 * ============================================================================
 */

(function() {

    //------------------------------------------------------------------------
    // Evaluate an Extended DoT/Regen state's current expected value.
    //
    // Returns:
    //   Positive = regeneration/healing
    //   Negative = damage/drain
    //
    // Variance is intentionally NOT applied.
    // Elemental rate IS applied.
    //------------------------------------------------------------------------

    Game_Battler.prototype.extDotRegenValue = function(state) {
        if (!state) return 0;
        if (!state.dotFormula) return 0;

        var a = this.stateOrigin(state.id);
        var b = this;
        var user = this;
        var target = this;
        var origin = a;

        var s = $gameSwitches._data;
        var v = $gameVariables._data;

        var value = 0;
        var healing = false;

        var variance = state.dotVariance;
        var element = state.dotElement;

        try {
            eval(state.dotFormula);
        } catch (e) {
            console.error(
                'HERO_TotalRegen: Error evaluating ExtDoT formula for state ' +
                state.id
            );
            console.error(state.dotFormula);
            console.error(e);
            return 0;
        }

        value = Number(value);

        if (isNaN(value)) return 0;

        // Mirror ExtDoT's healing/damage sign handling.
        value = Math.abs(value);

        if (!healing) {
            value *= -1;
        }

        // Apply target's elemental rate, but deliberately skip variance.
        if (element && element !== 0) {
            value *= this.elementRate(element);
        }

        return value;
    };


    //------------------------------------------------------------------------
    // Total Extended DoT/Regen from all active states.
    //------------------------------------------------------------------------

    Game_Battler.prototype.totalExtDotRegen = function() {
        var value = 0;
        var states = this.states();

        for (var i = 0; i < states.length; i++) {
            value += this.extDotRegenValue(states[i]);
        }

        return value;
    };


    //------------------------------------------------------------------------
    // Total HP Regen
    //------------------------------------------------------------------------

    Game_Battler.prototype.totalHpRegen = function() {
        var value = 0;

        if (this.flatHpRegen) {
            value += this.flatHpRegen();
        }

        value += this.totalExtDotRegen();

        return value;
    };


    //------------------------------------------------------------------------
    // Total MP Regen
    //
    // Note:
    // Standard YEP_X_ExtDoT primarily processes HP-based DoT/Regen.
    // Therefore this currently combines Flat MP Regen with any future/
    // modified ExtDoT implementation that explicitly exposes MP effects.
    //------------------------------------------------------------------------

    Game_Battler.prototype.totalMpRegen = function() {
        var value = 0;

        if (this.flatMpRegen) {
            value += this.flatMpRegen();
        }

        return value;
    };

})();