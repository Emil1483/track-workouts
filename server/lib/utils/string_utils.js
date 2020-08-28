"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padLeft = void 0;
function padLeft(value) {
    if (value % 1 != 0)
        throw new Error('value must be an integer');
    return (value < 10 ? '0' : '') + value.toFixed(0);
}
exports.padLeft = padLeft;
