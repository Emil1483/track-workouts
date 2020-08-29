"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDayFromString = exports.floorToDay = void 0;
const string_utils_1 = require("./string_utils");
function floorToDay(date) {
    let dateString = `${date.getFullYear()}`;
    dateString += `-${string_utils_1.padLeft(date.getMonth() + 1)}`;
    dateString += `-${string_utils_1.padLeft(date.getDate())}`;
    return new Date(Date.parse(dateString));
}
exports.floorToDay = floorToDay;
function getDayFromString(string) {
    return floorToDay(new Date(Date.parse(string)));
}
exports.getDayFromString = getDayFromString;
