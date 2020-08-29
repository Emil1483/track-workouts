"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noWorkoutsExistsWith = exports.tooManyWorkoutsExistsWith = void 0;
function tooManyWorkoutsExistsWith(date) {
    return new Error(`the database contains two or more workouts with date ${date.toJSON()}`);
}
exports.tooManyWorkoutsExistsWith = tooManyWorkoutsExistsWith;
function noWorkoutsExistsWith(date) {
    return new Error(`the database does not contain any workouts with date ${date.toJSON()}`);
}
exports.noWorkoutsExistsWith = noWorkoutsExistsWith;
