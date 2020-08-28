"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contains = void 0;
function contains(array, element) {
    for (const i in array) {
        if (array[i] == element)
            return true;
    }
    return false;
}
exports.contains = contains;
