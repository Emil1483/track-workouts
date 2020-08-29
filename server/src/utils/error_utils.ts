export function tooManyWorkoutsExistsWith(date: Date) {
    return new Error(`the database contains two or more workouts with date ${date.toJSON()}`);
}

export function noWorkoutsExistsWith(date: Date) {
    return new Error(`the database does not contain any workouts with date ${date.toJSON()}`);
}