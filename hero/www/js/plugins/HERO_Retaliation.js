//=============================================================================
// HERO_Retaliation.js
//=============================================================================
/*:
 * @plugindesc v1.10 Adds "RET" (Retaliation) - a partial counter that triggers
 * after taking HP damage, using a real queued battle action.
 * @author HERO
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * Retaliation is a partial counterattack: you still receive damage, but you
 * have a chance to hit back after the current action finishes.
 *
 * RET is separate from the normal CNT (counterattack) rate.
 *
 * Retaliation:
 *   - triggers after actual HP damage
 *   - does not trigger on misses, evades, or 0 damage
 *   - requires the defender and attacker to still be alive when queued
 *   - uses the configured retaliation skill
 *   - executes that skill as a REAL battle action
 *   - therefore plays the skill's normal animation, motion, action sequence,
 *     battle log, damage popup, states, etc.
 *   - does not recursively trigger another retaliation
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 * Use these notetags on actors, classes, enemies, weapons, armors, or states:
 *
 *   <RET: 15%>          -> 15% retaliation rate
 *   <RET: 0.15>         -> 15% retaliation rate
 *   <RET: 15>           -> also 15% (numbers > 1 are treated as percent)
 *
 *   <RET Skill: x>      -> Use skill ID x for retaliation.
 *                           If omitted, uses the battler's normal attack skill.
 *
 * All RET rates are summed and capped at 100%.
 *
 * ============================================================================
 * Script Calls
 * ============================================================================
 *   battler.ret        -> returns total retaliation rate (0..1)
 *   battler.retSkillId -> returns retaliation skill ID (0 = normal attack)
 *
 * ============================================================================
 * Compatibility
 * ============================================================================
 * Requires RPG Maker MV.
 *
 * This plugin is designed to work with Yanfly's Battle Engine Core and
 * Action Sequence Packs. When Yanfly's Battle Engine Core is installed,
 * retaliation is placed into its forced-action queue so the retaliation skill
 * runs through the normal Yanfly action system instead of being manually
 * applied.
 *
 * Put HERO_Retaliation.js BELOW YEP_BattleEngineCore.js and, if used,
 * below the Yanfly Action Sequence plugins.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 * v1.10 - Reworked retaliation execution:
 *        - Retaliation is queued instead of executed inside gainHp().
 *        - Retaliation now occurs after the current action finishes.
 *        - Uses Yanfly's queueForceAction when available.
 *        - The retaliation skill is executed as a real battle action.
 *        - Skill animations and Yanfly action sequences now play normally.
 *        - Removed manual animation, manual damage application, and manual
 *          popup handling.
 *        - Fixed popup ownership issues caused by nested action.apply().
 *        - Added a retaliation-action loop guard.
 *        - Removed the old _result._attacker mechanism.
 *
 * v1.02 - Previous rewrite.
 * v1.01 - Fixed hook location.
 * v1.00 - Initial release.
 */

var Imported = Imported || {};
Imported.HERO_Retaliation = true;

//=============================================================================
// Parameters
//=============================================================================

var parameters = PluginManager.parameters('HERO_Retaliation');
var retCostFree = false;

//=============================================================================
// DataManager - Parse Notetags
//=============================================================================

(function() {

    function parseRetNotetag(obj, line) {

        // RET rate
        var match = line.match(/<(?:RET):\s*([\d.]+)\s*%?>/i);

        if (match) {
            var val = parseFloat(match[1]);

            if (line.match(/%/i) || val > 1) {
                val /= 100;
            }

            obj._retRate = (obj._retRate || 0) + val;
            return true;
        }

        // RET Skill
        var skillMatch =
            line.match(/<(?:RET SKILL):\s*(\d+)>/i);

        if (skillMatch) {
            obj._retSkillId = parseInt(skillMatch[1]);
            return true;
        }

        return false;
    }

    var _DataManager_isDatabaseLoaded =
        DataManager.isDatabaseLoaded;

    DataManager.isDatabaseLoaded = function() {

        if (!_DataManager_isDatabaseLoaded.call(this)) {
            return false;
        }

        if (!this._heroRetNotetagsProcessed) {
            this.processRetNotetags();
            this._heroRetNotetagsProcessed = true;
        }

        return true;
    };

    DataManager.processRetNotetags = function() {

        var groups = [
            $dataActors,
            $dataClasses,
            $dataEnemies,
            $dataWeapons,
            $dataArmors,
            $dataStates
        ];

        for (var g = 0; g < groups.length; g++) {

            var group = groups[g];

            if (!group) continue;

            for (var i = 1; i < group.length; i++) {

                var obj = group[i];

                if (!obj) continue;

                obj._retRate = 0;
                obj._retSkillId = 0;

                this.processRetNotetagsFor(obj);
            }
        }
    };

    DataManager.processRetNotetagsFor = function(obj) {

        if (!obj.note) return;

        var lines = obj.note.split(/[\r\n]+/);

        for (var i = 0; i < lines.length; i++) {
            parseRetNotetag(obj, lines[i]);
        }

        if (obj._retRate > 1) {
            obj._retRate = 1;
        }
    };

})();

//=============================================================================
// Game_BattlerBase - RET and RET Skill getters
//=============================================================================

Object.defineProperty(Game_BattlerBase.prototype, 'ret', {

    get: function() {

        var value = 0;

        if (this.isActor()) {

            var actor = this.actor();

            if (actor) {
                value += actor._retRate || 0;
            }

            var cls = this.currentClass();

            if (cls) {
                value += cls._retRate || 0;
            }

            var equips = this.equips();

            for (var i = 0; i < equips.length; i++) {

                var equip = equips[i];

                if (equip) {
                    value += equip._retRate || 0;
                }
            }

        } else {

            var enemy = this.enemy();

            if (enemy) {
                value += enemy._retRate || 0;
            }
        }

        var states = this.states();

        for (var i = 0; i < states.length; i++) {

            var state = states[i];

            if (state) {
                value += state._retRate || 0;
            }
        }

        if (this._retOverride !== undefined) {
            value = this._retOverride;
        }

        return Math.min(value, 1);
    },

    set: function(value) {

        this._retOverride = Math.min(value, 1);
    },

    configurable: true,
    enumerable: true
});

Object.defineProperty(Game_BattlerBase.prototype, 'retSkillId', {

    get: function() {

        var id = 0;

        if (this.isActor()) {

            var actor = this.actor();

            if (actor && actor._retSkillId) {
                id = actor._retSkillId;
            }

            var cls = this.currentClass();

            if (cls && cls._retSkillId) {
                id = cls._retSkillId;
            }

            var equips = this.equips();

            for (var i = 0; i < equips.length; i++) {

                var equip = equips[i];

                if (equip && equip._retSkillId) {
                    id = equip._retSkillId;
                }
            }

        } else {

            var enemy = this.enemy();

            if (enemy && enemy._retSkillId) {
                id = enemy._retSkillId;
            }
        }

        var states = this.states();

        for (var i = 0; i < states.length; i++) {

            var state = states[i];

            if (state && state._retSkillId) {
                id = state._retSkillId;
            }
        }

        return id;
    }
});

//=============================================================================
// Retaliation Queue
//=============================================================================

(function() {

    function ensureQueue() {

        if (!BattleManager._heroRetaliationQueue) {
            BattleManager._heroRetaliationQueue = [];
        }
    }

    function queueRetaliation(retaliator, attacker) {
        console.log("Retaliation queued.");

        ensureQueue();

        if (!retaliator || !attacker) return;

        if (!retaliator.isAlive() || !attacker.isAlive()) {
            return;
        }

        var skillId = retaliator.retSkillId;

        if (!skillId) {
            skillId = retaliator.attackSkillId();
        }

        var skill = $dataSkills[skillId];

        if (!skill) return;

        // RET requires the user to be able to use the skill.
        // If they don't have enough MP/TP, the retaliation simply doesn't happen.
        if (!retCostFree && !retaliator.canPaySkillCost(skill)) return;

        console.log("All passed.");

        BattleManager._heroRetaliationQueue.push({
            user: retaliator,
            target: attacker,
            skillId: skillId
        });
    }

    //=========================================================================
    // Queue a retaliation
    //=========================================================================

    Game_Battler.prototype.queueRetaliation = function(attacker) {

        queueRetaliation(this, attacker);
    };

    //=========================================================================
    // Process one queued retaliation
    //=========================================================================

    BattleManager.processHeroRetaliationQueue = function() {

        ensureQueue();

        if (this._heroRetaliationProcessing) {
            return;
        }

        if (this._heroRetaliationQueue.length <= 0) {
            return;
        }

        // Never interrupt an action that is still running.
        if (this._phase === 'action') {
            return;
        }

        console.log("No action still running.");

        var entry = this._heroRetaliationQueue.shift();

        if (!entry) return;
        console.log("There's an entry.");

        var user = entry.user;
        var target = entry.target;

        // The target may have died before the retaliation gets its turn.
        if (!user || !target) {
            return;
        }

        if (!user.isAlive() || !target.isAlive()) {
            return;
        }

        console.log("User and target are alive and well.");

        var skill = $dataSkills[entry.skillId];

        if (!skill) {
            return;
        }

        console.log("Skill is found.");

        this._heroRetaliationProcessing = true;

        //=====================================================================
        // Yanfly Battle Engine Core
        //=====================================================================

        if (typeof this.queueForceAction === 'function') {

            if (retCostFree) {
                user._heroRetaliationCostFree = true;
            }

            user._heroRetaliationPending = true;

            /*
             * Yanfly's forced-action system will execute this as a genuine
             * battle action. This means the skill goes through the normal
             * animation / motion / action-sequence / damage / popup pipeline.
             */
            this.queueForceAction(
                user,
                entry.skillId,
                target
            );

            this._heroRetaliationProcessing = false;

            console.log("Should all have been finished (yanfly).");

            return;
        }

        //=====================================================================
        // Vanilla MV fallback
        //=====================================================================

        if (typeof user.forceAction === 'function' &&
            typeof this.forceAction === 'function') {

            user.forceAction(
                entry.skillId,
                target.index()
            );

            user._heroRetaliationPending = true;

            this.forceAction(user);

            this._heroRetaliationProcessing = false;

            console.log("Should all have been finished (vanilla).");
            return;
        }

        this._heroRetaliationProcessing = false;
    };

    //=========================================================================
    // Mark forced retaliation actions
    //=========================================================================

    var _BattleManager_startAction =
    BattleManager.startAction;

    BattleManager.startAction = function() {

        _BattleManager_startAction.call(this);

        var subject = this._subject;

        if (subject && subject._heroRetaliationPending) {

            if (this._action) {
                this._action._heroIsRetaliation = true;
            }

            subject._heroRetaliationPending = false;

            this._heroRetaliationActiveSubject = subject;
        }
    };

    //=========================================================================
    // When an action ends, process the next retaliation
    //=========================================================================

    var _BattleManager_endAction =
        BattleManager.endAction;

    BattleManager.endAction = function() {

        _BattleManager_endAction.call(this);

        this._heroRetaliationActiveSubject = null;

        this.processHeroRetaliationQueue();
    };

    //=========================================================================
    // Cost-free retaliation
    //=========================================================================

    var _Game_BattlerBase_paySkillCost =
        Game_BattlerBase.prototype.paySkillCost;

    Game_BattlerBase.prototype.paySkillCost = function(skill) {

        if (this._heroRetaliationCostFree) {

            this._heroRetaliationCostFree = false;

            return;
        }

        _Game_BattlerBase_paySkillCost.call(this, skill);
    };

})();

//=============================================================================
// Game_Action - Detect Actual HP Damage
//=============================================================================

(function() {

    var _Game_Action_executeDamage =
        Game_Action.prototype.executeDamage;

    Game_Action.prototype.executeDamage = function(target, value) {

        // Let MV/Yanfly actually apply the damage first.
        _Game_Action_executeDamage.call(this, target, value);

        // Only during battle.
        if (!$gameParty.inBattle()) return;

        if (!target) return;

        //=========================================================================
        // Confirm that actual HP damage was dealt
        //=========================================================================

        var result = target.result();

        if (!result) return;

        // hpDamage > 0 means this action actually dealt HP damage.
        //
        // This automatically excludes:
        // - misses
        // - evasion
        // - 0 damage
        // - HP healing
        // - MP damage
        if (result.hpDamage <= 0) return;

        // The retaliator must survive the hit.
        if (!target.isAlive()) return;

        //=========================================================================
        // Identify the attacker
        //=========================================================================

        var attacker = this.subject();

        if (!attacker) return;

        // Don't retaliate against yourself.
        if (attacker === target) return;

        // The attacker must still be alive.
        if (!attacker.isAlive()) return;

        //=========================================================================
        // Prevent retaliation chains
        //=========================================================================

        /*
         * If this action itself is a retaliation, don't allow its damage to
         * generate another retaliation.
         */

        if (this._heroIsRetaliation) return;

        //=========================================================================
        // Check retaliation chance
        //=========================================================================

        var rate = target.ret;

        if (rate <= 0) return;

        if (Math.random() >= rate) return;

        //=========================================================================
        // Queue retaliation
        //=========================================================================

        /*
         * Do NOT execute the retaliation here.
         *
         * The original action is still in the middle of resolving.
         * queueRetaliation() stores the retaliation, and the existing
         * BattleManager.endAction hook handles it after the current action
         * has completely finished.
         */

        target.queueRetaliation(attacker);

    };

})();

//=============================================================================
// BattleManager - Initialize Retaliation Queue
//=============================================================================

(function() {

    var _BattleManager_startBattle =
        BattleManager.startBattle;

    BattleManager.startBattle = function() {

        this._heroRetaliationQueue = [];

        this._heroRetaliationProcessing = false;

        this._heroRetaliationActiveSubject = null;

        _BattleManager_startBattle.call(this);
    };

})();

//=============================================================================
// End of File
//=============================================================================

//=============================================================================
// CTB Compatibility - Retaliation Does Not Consume a Turn
//=============================================================================

(function() {

    if (!Imported.YEP_X_BattleSysCTB) return;

    //-------------------------------------------------------------------------
    // CTB has its own endAction implementation. Normally it does:
    //
    //   subject.endTurnAllCTB();
    //
    // which resets the battler's CTB gauge and consumes their turn.
    //
    // For a retaliation, we instead want the forced action to finish and then
    // return to the CTB state that existed before the retaliation.
    //-------------------------------------------------------------------------

    var _BattleManager_endCTBAction =
        BattleManager.endCTBAction;

    BattleManager.endCTBAction = function() {

        var action = this._action;

        var isRetaliation =
            action && action._heroIsRetaliation;

        // Normal CTB actions use Yanfly's original behavior.
        if (!isRetaliation) {
            _BattleManager_endCTBAction.call(this);
            return;
        }

        //=====================================================================
        // RETALIATION ACTION
        //=====================================================================

        /*
         * This is essentially Yanfly's forced-action restoration path, but
         * deliberately skips endTurnAllCTB().
         *
         * The retaliation is not a real CTB turn.
         */

        if (Imported.YEP_BattleEngineCore) {

            if (this._processingForcedAction) {
                this._phase = this._preForcePhase;
            }

            this._processingForcedAction = false;
        }

        // Let Yanfly perform its normal end-of-action bookkeeping.
        if (this._subject) {
            this._subject.onAllActionsEnd();
        }

        if (this.updateEventMain()) {
            return;
        }

        /*
         * IMPORTANT:
         *
         * loadPreForceActionSettings() restores the CTB state that existed
         * before the retaliation was forced.
         *
         * We deliberately do this BEFORE any normal CTB turn-ending logic.
         */
        if (this.loadPreForceActionSettings()) {
            return;
        }

        /*
         * This should normally not be reached for a Yanfly forced action,
         * but leave the battle in CTB rather than consuming a turn.
         */
        this.setCTBPhase();
    };

})();