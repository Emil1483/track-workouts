"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkouts = exports.insertWorkout = exports.deleteWorkout = exports.updateWorkout = exports.getWorkoutsFrom = void 0;
const monk_1 = __importDefault(require("monk"));
const db = monk_1.default('localhost/track-workouts');
const workouts = db.get('workouts');
async function getWorkoutsFrom(date) {
    return await workouts.find({ 'date': date });
}
exports.getWorkoutsFrom = getWorkoutsFrom;
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
async function getWorkouts() {
    return await workouts.find();
}
exports.getWorkouts = getWorkouts;
