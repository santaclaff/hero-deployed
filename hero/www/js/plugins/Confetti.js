// ==Plugin==
// @name confetti
// @desc A plugin to add colorful confetti effect to the game.
// ==/Plugin==

(function() {
    var confettiEnabled = false;
    var confettiContainer = null;
    var shouldStopConfetti = false; // New variable

    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        if (confettiEnabled && !shouldStopConfetti) { // Check shouldStopConfetti
            this.startConfettiEffect();
        }
    };

    var _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        _Scene_Map_terminate.call(this);
        shouldStopConfetti = true; // Set to true when scene terminates
        this.stopConfettiEffect();
    };

    Scene_Map.prototype.startConfettiEffect = function() {
        confettiContainer = new Sprite();
        confettiContainer.z = 10;
        this.addChild(confettiContainer);

        var confettiImages = ['confetti', 'confetti2', 'confetti3'];
        var numConfetti = 150;

        for (var i = 0; i < numConfetti; i++) {
            var confettiImage = confettiImages[Math.floor(Math.random() * confettiImages.length)];
            var confetti = new Sprite(ImageManager.loadPicture(confettiImage));
            confetti.x = Math.random() * Graphics.width;
            confetti.y = -Math.random() * 600 - 20;
            confetti.anchor.x = 0.5;
            confetti.anchor.y = 0.5;
            confetti.rotationSpeed = Math.random() * 0.1 - 0.05;
            confetti.fallSpeed = Math.random() * 1 + 1;
            confetti.tilt = Math.random() * 4 - 2;
            //confetti.blendMode = PIXI.BLEND_MODES.ADD;
            confettiContainer.addChild(confetti);
        }

        confettiContainer.update = function() {
            for (var i = 0; i < this.children.length; i++) {
                var confetti = this.children[i];
                confetti.rotation += confetti.rotationSpeed;
                confetti.y += confetti.fallSpeed;
                confetti.x += Math.sin(confetti.rotation) * confetti.tilt;

                if (confetti.y > Graphics.height) {
                    confetti.x = Math.random() * Graphics.width;
                    confetti.y = -400;
                }
            }
        };
    };

    Scene_Map.prototype.stopConfettiEffect = function() {
        if (confettiContainer) {
            this.removeChild(confettiContainer);
            confettiContainer = null;
        }
    };

})();