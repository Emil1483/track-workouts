"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const validation_1 = require("./utils/validation");
const date_utils_1 = require("./utils/date_utils");
const database_utils_1 = require("./utils/database_utils");
const error_utils_1 = require("./utils/error_utils");
const app = express_1.default();
app.use(cors_1.default());
app.use(morgan_1.default('tiny'));
app.use(body_parser_1.json());
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));
app.get('/', (req, res) => {
    res.status(200).json({ 'message': '😀' });
});
app.get('/workouts', async (req, res, next) => {
    try {
        const options = await validation_1.validateGetWorkouts(req.query);
        const [workouts, total] = await Promise.all([database_utils_1.getWorkouts(options), database_utils_1.getWorkoutsCount()]);
        res.status(200).json({ options: options, 'totalWorkouts': total, 'workouts': workouts });
    }
    catch (error) {
        next(error);
    }
});
app.get('/workouts/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const workout = await database_utils_1.getWorkoutById(id);
        res.status(200).json(workout);
    }
    catch (error) {
        next(error);
    }
});
app.post('/workouts', async (req, res, next) => {
    try {
        const body = req.body;
        await validation_1.validatePost(body);
        const date = date_utils_1.getDayFromString(body.date);
        const existing = await database_utils_1.getWorkoutsFrom(date);
        if (existing.length > 1)
            throw error_utils_1.tooManyWorkoutsExistsWith(date);
        const isUpdating = existing.length == 1;
        if (isUpdating) {
            const existingExercises = Object.keys(existing[0].exercises);
            if (existingExercises.length - 2 >= body.exercises.length) {
                throw new Error('you are removing too many exercises');
            }
        }
        if (body.exercises.length == 0) {
            await database_utils_1.deleteWorkout(date);
            res.status(200).json({ 'message': 'success' });
            return;
        }
        const exercises = {};
        body.exercises.forEach(exercise => {
            exercises[exercise.name] = exercise.sets;
        });
        const workout = { date: date, exercises: exercises };
        if (isUpdating) {
            await database_utils_1.updateWorkout(workout);
        }
        else {
            await database_utils_1.insertWorkout(workout);
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
        const date = date_utils_1.getDayFromString(body.date);
        const existing = await database_utils_1.getWorkoutsFrom(date);
        if (existing.length > 1)
            throw error_utils_1.tooManyWorkoutsExistsWith(date);
        if (existing.length == 0)
            throw error_utils_1.noWorkoutsExistsWith(date);
        const workout = existing[0];
        if (body.exercises) {
            body.exercises.forEach(exercise => {
                if (workout.exercises[exercise] == undefined)
                    throw error_utils_1.exerciseDoesNotExist(exercise);
                delete workout.exercises[exercise];
            });
            if (Object.entries(workout.exercises).length > 0) {
                await database_utils_1.updateWorkout(workout);
                res.status(200).json({ 'message': 'success', 'currentWorkout': workout });
                return;
            }
        }
        await database_utils_1.deleteWorkout(date);
        res.status(200).json({ 'message': 'success' });
    }
    catch (error) {
        next(error);
    }
});
app.use((error, req, res, next) => {
    console.log(`error: ${error.message}`);
    res.status(500).json({ error: error.message });
});
