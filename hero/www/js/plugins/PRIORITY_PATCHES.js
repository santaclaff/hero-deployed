//=============================================================================
// Patch: Skip background loading entirely for SRD_NameInputUpgrade
// Place this ABOVE SRD_NameInputUpgrade.js
//=============================================================================

(function() {

    // Completely override the background creation - do nothing
    Scene_Name.prototype.createBackground = function() {
        // Intentionally left blank - no background, no crash
        // This prevents the plugin from even trying to load a background
    };

})();