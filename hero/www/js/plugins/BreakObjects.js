/*:
 * @plugindesc v2.4 OverworldSkillBreak: Fixed multi-hit animations and damage calculation.
 */
(() => {
    'use strict';
    let _activeAction = null;

    //region Game_Event Modifications
    const _Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function(mapId, eventId) {
        _Game_Event_initialize.call(this, mapId, eventId);
        const note = this.event().note || '';
        this._hp = parseInt((note.match(/<hp:\s*(\d+)>/i) || [0,0])[1]) || 0;
        this._def = parseInt((note.match(/<def:\s*(\d+)>/i) || [0,0])[1]) || 0;
        this._mdef = parseInt((note.match(/<mdef:\s*(\d+)>/i) || [0,0])[1]) || 0;
    };
    //endregion

    //region Scene_Map Updates
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (!_activeAction) return;

        if (_activeAction.waitFrames > 0) {
            _activeAction.waitFrames--;
            return;
        }

        processHit(_activeAction);
    };

    function processHit(action) {
        if (action.currentHit >= action.repeats) {
            _activeAction = null;
            return;
        }

        const target = action.target;
        const user = action.user;
        action.currentHit++;

        // Play animation
        const animTarget = target && target._hp > 0 ? target : user;
        $gameTemp.requestAnimation([animTarget], action.animId);
        
        // Apply damage if valid target
        if (target && target._hp > 0) {
            const damage = calculateDamage(action.actor, action.skill, target);
            target._hp = Math.max(target._hp - damage, 0);
            
            if (target._hp <= 0) {
                $gameSelfSwitches.setValue([target._mapId, target._eventId, 'A'], true);
                $gameMap.requestRefresh();
                _activeAction = null; // Stop subsequent hits
                return;
            }
        }

        action.waitFrames = 24; // Wait 24 frames (0.4s) for next hit
    }
    //endregion

    //region Damage Calculation
    function calculateDamage(actor, skill, target) {
        const formula = skill.damage.formula
            .replace(/a\.atk/g, actor.atk)
            .replace(/a\.mat/g, actor.mat)
            .replace(/b\.def/g, target._def)
            .replace(/b\.mdef/g, target._mdef);

        try {
            let value = eval(formula);
            if (skill.damage.variance > 0) {
                const amp = Math.max(1, Math.abs(value) * skill.damage.variance / 100);
                value += Math.randomInt(amp + 1) - Math.randomInt(amp + 1);
            }
            return Math.max(0, Math.round(value));
        } catch(e) {
            console.error("Damage error:", e);
            return 0;
        }
    }
    //endregion

    //region Skill Handling
    const _Scene_Skill_useItem = Scene_Skill.prototype.useItem;
    Scene_Skill.prototype.useItem = function() {
        const skill = this.item();
        const actor = this.actor();
        
        if (this.isValidFieldSkill(skill)) {
            const user = findMapCharacter(actor);
            const dir = user.direction();
            const tx = user.x + (dir === 6 ? 1 : dir === 4 ? -1 : 0);
            const ty = user.y + (dir === 2 ? 1 : dir === 8 ? -1 : 0);
            const target = $gameMap.eventsXy(tx, ty)[0] || null;

            // Setup multi-hit action
            const action = new Game_Action(actor, false);
            action.setSkill(skill.id);
            
            _activeAction = {
                actor: actor,
                skill: skill,
                user: user,
                target: target,
                animId: skill.animationId > 0 ? skill.animationId : user.attackAnimationId1(),
                repeats: action.numRepeats(),
                currentHit: 0,
                waitFrames: 0
            };

            actor.paySkillCost(skill);
            SceneManager.goto(Scene_Map);
        } else {
            _Scene_Skill_useItem.call(this);
        }
    };

    function findMapCharacter(actor) {
        if ($gameParty.leader() === actor) return $gamePlayer;
        const followers = $gamePlayer.followers().followers();
        return followers.find(f => f.actor() === actor) || $gamePlayer;
    }

    Scene_Skill.prototype.isValidFieldSkill = function(skill) {
        return skill && skill.damage.type > 0 && !$gameParty.inBattle();
    };
    //endregion

    //region Skill Menu Enabling
    const _Window_SkillList_isEnabled = Window_SkillList.prototype.isEnabled;
    Window_SkillList.prototype.isEnabled = function(item) {
        if (SceneManager._scene instanceof Scene_Map && DataManager.isSkill(item)) {
            return item.damage.type > 0;
        }
        return _Window_SkillList_isEnabled.call(this, item);
    };
    //endregion
})();