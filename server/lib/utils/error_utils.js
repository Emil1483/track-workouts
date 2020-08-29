"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notSupportedAttribute = exports.hasEmptySet = exports.incorrectPassword = exports.noWorkoutsExistsWith = exports.tooManyWorkoutsExistsWith = void 0;
function tooManyWorkoutsExistsWith(date) {
    return new Error(`the database contains two or more workouts with date '${date.toJSON()}'`);
}
exports.tooManyWorkoutsExistsWith = tooManyWorkoutsExistsWith;
function noWorkoutsExistsWith(date) {
    return new Error(`the database does not contain any workouts with date '${date.toJSON()}'`);
}
exports.noWorkoutsExistsWith = noWorkoutsExistsWith;
exports.incorrectPassword = new Error('incorrect password');
function hasEmptySet(exercise) {
    return new Error(`'${exercise.name}' contains an empty set`);
}
exports.hasEmptySet = hasEmptySet;
function notSupportedAttribute(attribute, exercise) {
    return new Error(`'${attribute}' in '${exercise.name}' is not a supported attribute`);
}
exports.notSupportedAttribute = notSupportedAttribute;
