(function() {

const _CTB_onTurnStart =
Game_Battler.prototype.onTurnStart;

Game_Battler.prototype.onTurnStart = function() {

    _CTB_onTurnStart.call(this);

    if (this.states) {
        this.states().forEach(function(state) {

            if (state.customEffectEval &&
                state.customEffectEval.turnStartState) {

                var code = state.customEffectEval.turnStartState;
                var user = this;
                var target = this;
                var origin = this;

                try {
                    eval(code);
                } catch (e) {
                    console.error(e);
                }
            }

        }, this);
    }
};

})();