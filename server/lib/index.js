"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const monk_1 = __importDefault(require("monk"));
const validation_1 = require("./utils/validation");
const date_utils_1 = require("./utils/date_utils");
const db = monk_1.default('localhost/track-workouts');
const workouts = db.get('workouts');
const app = express_1.default();
app.use(cors_1.default());
app.use(morgan_1.default('tiny'));
app.use(body_parser_1.json());
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));
app.get('/', (req, res) => {
    res.status(200).json({ 'message': '😀' });
});
app.get('/workouts', async (req, res) => {
    const data = await workouts.find();
    res.status(200).json({ 'workouts': data });
});
app.post('/workouts', async (req, res, next) => {
    try {
        const body = req.body;
        await validation_1.validatePost(body);
        let date = date_utils_1.floorToDay(new Date(Date.parse(body.date)));
        const existing = await workouts.find({ 'date': date });
        if (existing.length > 1)
            throw new Error(`the database contains two or more workouts with date ${date.toJSON()}`);
        const isUpdating = existing.length == 1;
        const exercises = isUpdating ? existing[0].exercises : {};
        body.exercises.forEach(exercise => {
            exercises[exercise.name] = exercise.sets;
        });
        const workout = { date: date, exercises: exercises };
        if (isUpdating) {
            await workouts.findOneAndUpdate({ 'date': date }, { $set: workout });
        }
        else {
            await workouts.insert(workout);
        }
        res.status(200).json({ 'message': 'success', 'workout': workout });
    }
    catch (error) {
        next(error);
    }
});
app.delete('/workouts', async (req, res, next) => {
    try {
        const body = req.body;
        await validation_1.validateDelete(body);
        let date = date_utils_1.floorToDay(new Date(Date.parse(body.date)));
        const existing = await workouts.find({ 'date': date });
        if (existing.length > 1)
            throw new Error(`the database contains two or more workouts with date ${date.toJSON()}`);
        if (existing.length == 0)
            throw new Error(`the database does not contain any workouts with date ${date.toJSON()}`);
        const workout = existing[0];
        if (body.exercises) {
            body.exercises.forEach(exercise => {
                if (workout.exercises[exercise] == undefined)
                    throw new Error(`${exercise} did not exist in workout`);
                delete workout.exercises[exercise];
            });
            if (Object.entries(workout.exercises).length === 0) {
                await workouts.findOneAndDelete({ 'date': date });
                res.status(200).json({ 'message': 'success', 'currentWorkout': 'DELETED' });
            }
            else {
                await workouts.findOneAndUpdate({ 'date': date }, { $set: workout });
                res.status(200).json({ 'message': 'success', 'currentWorkout': workout });
            }
            return;
        }
        else {
            await workouts.findOneAndDelete({ 'date': date });
            res.status(200).json({ 'message': 'success', 'currentWorkout': 'DELETED' });
        }
    }
    catch (error) {
        next(error);
    }
});
app.use((error, req, res, next) => {
    console.log(`error: ${error.message}`);
    res.status(500).json({ error: error.message });
});
