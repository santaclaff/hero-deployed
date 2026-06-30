/*:
 * @plugindesc Custom damage formula helpers (ratio-based damage).
 * @author You
 *
 * @help
 * Usage in damage formula box:
 *   DF.physical(a, b, power)
 *
 * Example:
 *   DF.physical(a, b, 50)
 *
 * This calculates:
 *   a.atk^2 / (a.atk + b.def) * (1 + power / 50)
 */

var DF = DF || {};
DF.physical = function(a, b, power, pen) {
    power = power || 0; pen = pen || 0;

    var atk = Math.max(1, a.atk);
    var def = Math.max(0, b.def);

    return (atk) / (atk + def * (1 - pen)) * Math.max(power * 0.5, power + (atk - def * (1 - pen)) / 2);
};

DF.magical = function(a, b, power, pen) {
    power = power || 0; pen = pen || 0;

    var atk = Math.max(1, a.mat);
    var def = Math.max(0, b.mdf);

    return (atk) / (atk + def * (1 - pen)) * Math.max(power * 0.5, power + 1.25 * (atk - def * (1 - pen)) / 2);
};