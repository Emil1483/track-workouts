import { Exercise } from "./validation";

export function tooManyWorkoutsExistsWith(date: Date) {
    return new Error(`the database contains two or more workouts with date '${date.toJSON()}'`);
}

export function noWorkoutsExistsWith(date: Date) {
    return new Error(`the database does not contain any workouts with date '${date.toJSON()}'`);
}

export const incorrectPassword = new Error('incorrect password');

export function hasEmptySet(exercise: Exercise) {
    return new Error(`'${exercise.name}' contains an empty set`);
}

export function notSupportedAttribute(attribute: string, exercise: Exercise) {
    return new Error(`'${attribute}' in '${exercise.name}' is not a supported attribute`);
}

export function exerciseDoesNotExist(exercise: string) {
    return new Error(`${exercise} does not exist in the workout`);
}