//=============================================================================
// Map Regen Extension (20 Steps = 1 Turn)
//=============================================================================

(function() {

  // Track steps
  const _Game_Player_increaseSteps = Game_Player.prototype.increaseSteps;
  Game_Player.prototype.increaseSteps = function() {
    _Game_Player_increaseSteps.call(this);
    this.processMapRegenTick();
  };

  Game_Player.prototype.processMapRegenTick = function() {
    if ($gameParty.inBattle()) return;

    if ($gameParty.steps() % 20 !== 0) return;

    $gameParty.members().forEach(function(actor) {
      if (!actor.isAlive()) return;

      // === YEP Extended DoT States ===
      actor.states().forEach(function(state) {
        if (!state || !state.dotFormula) return;

        var a = actor.stateOrigin(state.id);
        var b = actor;
        var user = actor;
        var target = actor;
        var origin = a;
        var s = $gameSwitches._data;
        var v = $gameVariables._data;

        var value = 0;
        var healing = false;
        var variance = state.dotVariance;
        var element = state.dotElement;

        try {
          eval(state.dotFormula);

          value = Math.abs(value);
          if (!healing) value *= -1;

          value = actor.applyDamageOverTimeVariance(value, variance);
          value = actor.applyDamageOverTimeElement(value, element);
          value = Math.round(value);

          if (value !== 0) {
            if (state.dotType === 'mp') {
              actor.gainMp(value);
            } else {
              actor.gainHp(value);
            }
          }

        } catch (e) {
          console.error("Map DoT Error", e);
        }

      });

      // === Flat Regen Stats ===
      if (actor.flatHpRegen) {
        const hp = actor.flatHpRegen();
        if (hp !== 0) actor.gainHp(hp);
      }

      if (actor.flatMpRegen) {
        const mp = actor.flatMpRegen();
        if (mp !== 0) actor.gainMp(mp);
      }

    });

  };

})();