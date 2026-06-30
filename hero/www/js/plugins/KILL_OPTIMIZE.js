//=============================================================================
// Remove Optimize Command
//=============================================================================

(function() {

const _makeCommandList = Window_EquipCommand.prototype.makeCommandList;
Window_EquipCommand.prototype.makeCommandList = function() {
    _makeCommandList.call(this);

    this._list = this._list.filter(function(cmd) {
        return cmd.symbol !== "optimize";
    });
};

})();