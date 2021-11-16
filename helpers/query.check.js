exports.isNumber = function (n) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
}
