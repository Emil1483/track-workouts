"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkoutsCount = exports.getWorkouts = exports.insertWorkout = exports.deleteWorkout = exports.updateWorkout = exports.getWorkoutById = exports.getWorkoutsFrom = void 0;
const monk_1 = __importDefault(require("monk"));
const date_utils_1 = require("./date_utils");
const db = monk_1.default('localhost/track-workouts');
const workouts = db.get('workouts');
async function getWorkoutsFrom(date) {
    return await workouts.find({ 'date': date });
}
exports.getWorkoutsFrom = getWorkoutsFrom;
async function getWorkoutById(id) {
    const results = await workouts.find({ '_id': id });
    return results[0];
}
exports.getWorkoutById = getWorkoutById;
async function updateWorkout(workout) {
    await workouts.findOneAndUpdate({ 'date': workout.date }, { $set: workout });
}
exports.updateWorkout = updateWorkout;
async function deleteWorkout(date) {
    await workouts.findOneAndDelete({ 'date': date });
}
exports.deleteWorkout = deleteWorkout;
async function insertWorkout(workout) {
    await workouts.insert(workout);
}
exports.insertWorkout = insertWorkout;
async function getWorkouts(options) {
    return await workouts.find(options.to == null ? {} : {
        date: {
            '$lte': date_utils_1.floorToDay(options.to),
        },
    }, {
        limit: options.limit,
        sort: { date: options.sort === 'ascending' ? 1 : -1 }
    });
}
exports.getWorkouts = getWorkouts;
async function getWorkoutsCount() {
    return await workouts.count();
}
exports.getWorkoutsCount = getWorkoutsCount;
