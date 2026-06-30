//=============================================================================
// MOG + YEP Event Spawner Fix (Indicators for Spawned Events)
//=============================================================================

(function() {

const _alias_createSpawnedEvent = Spriteset_Map.prototype.createSpawnedEvent;
Spriteset_Map.prototype.createSpawnedEvent = function(target) {
    _alias_createSpawnedEvent.call(this, target);

    // Get the newly created sprite (last one in array)
    const sprite = this._characterSprites[this._characterSprites.length - 1];

    // Create indicator for it
    if (!this._eventIndicators) this._eventIndicators = [];

    const indicator = new EventIndicators(sprite);
    this._eventIndicators.push(indicator);
    this._indicatorsField.addChild(indicator);
};

})();