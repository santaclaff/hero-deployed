(function() {

// ===============================
// 3. ADD WAIT COMMAND (SKILL #7)
// ===============================
const WAIT_SKILL_ID = 7;

const _createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
Scene_Battle.prototype.createActorCommandWindow = function() {
    _createActorCommandWindow.call(this);
    this._actorCommandWindow.setHandler('wait', this.commandWait.bind(this));
};

const _makeCommandList = Window_ActorCommand.prototype.makeCommandList;
Window_ActorCommand.prototype.makeCommandList = function() {
    _makeCommandList.call(this);
    this.addCommand('Wait', 'wait');
};

Scene_Battle.prototype.commandWait = function() {
    const action = BattleManager.inputtingAction();
    action.setSkill(WAIT_SKILL_ID);
    BattleManager.actor().setAction(0, action);
    this.selectNextCommand();
};

})();