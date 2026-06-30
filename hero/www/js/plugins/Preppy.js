(function() {

const _apply = Game_Action.prototype.apply;

Game_Action.prototype.apply = function(target) {

    console.log("==========");

    console.log("Skill:",
        this.item() ? this.item().name : "none");

    console.log("User:",
        this.subject().name());

    console.log("Target:",
        target.name());

    console.log("Certain Hit:",
        this.isCertainHit());

    console.log("Hit Formula:",
        this.itemHit(target));

    console.log("Eva Formula:",
        this.itemEva(target));

    _apply.call(this,target);

    console.log("Missed:",
        target.result().missed);

    console.log("Evaded:",
        target.result().evaded);

    console.log(target.result());

};

})();