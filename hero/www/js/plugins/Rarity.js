/*:
 * @plugindesc Rarity Colors (MV + Yanfly SIMPLE Mode Support) v4.0
 * @author You
 *
 * @help
 * Notetag:
 *   <itemRarity:x>
 *
 * 0 = No rarity (white)
 * 1 = F (dark grey)
 * 2 = E (light green)
 * 3 = D (green)
 * 4 = C (blue)
 * 5 = B (purple)
 * 6 = A (orange)
 * 7 = S (gold)
 */

(function(){

// ==============================
// RARITY → COLOR INDEX
// ==============================

function rarityColorIndex(rarity) {
    switch(rarity) {
        case 1: return 25;   // F - brown
        case 2: return 3;   // E - light green
        case 3: return 24;  // D - green
        case 4: return 1;   // C - blue
        case 5: return 30;  // B - purple
        case 6: return 20;  // A - orange
        case 7: return 14;  // S - gold
        default: return 0;  // no rarity
    }
}

// ==============================
// MENU + LISTS (ITEMS & SKILLS)
// ==============================

const _drawItemName = Window_Base.prototype.drawItemName;

Window_Base.prototype.drawItemName = function(item, x, y, width) {
    if (!item) return;

    width = width || 312;
    var iconBoxWidth = Window_Base._iconWidth + 4;

    this.resetTextColor();
    this.drawIcon(item.iconIndex, x + 2, y + 2);

    var rarity = item.meta && item.meta.itemRarity ? Number(item.meta.itemRarity) : 0;
    this.changeTextColor(this.textColor(rarityColorIndex(rarity)));

    this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
    this.resetTextColor();
};

// ==============================
// YANFLY SIMPLE MODE SUPPORT
// ==============================

const _displayAction = Window_BattleLog.prototype.displayAction;

Window_BattleLog.prototype.displayAction = function(subject, item) {

    // If not SIMPLE mode → use Yanfly default
    if (Yanfly.Param.BECShowActionText) {
        _displayAction.call(this, subject, item);
        return;
    }

    if (!item) return;

    const rarity = item.meta && item.meta.itemRarity ? Number(item.meta.itemRarity) : 0;
    const colorIndex = rarityColorIndex(rarity);

    this.push('pushBaseLine');

    let text = "<CENTER>\\I[" + item.iconIndex + "]";

    if (rarity > 0) {
        text += "\\C[" + colorIndex + "]" + item.name + "\\C[0]";
    } else {
        text += item.name;
    }

    this.push('addText', text);
    this.push('wait');
    this.push('popBaseLine');
};

})();