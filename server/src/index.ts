import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { json } from 'body-parser';
import cors from 'cors';
import monk from 'monk';

import { PostReqBody, DeleteReqBody, validatePost, validateDelete } from './utils/validation';
import { floorToDay } from './utils/date_utils';
import Workout from './utils/workout';

const db = monk('localhost/track-workouts');
const workouts = db.get('workouts');

const app = express();

app.use(cors());
app.use(morgan('tiny'));
app.use(json());

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
        const body: PostReqBody = req.body;
        await validatePost(body);

        let date = floorToDay(new Date(Date.parse(body.date)));

        const existing = await workouts.find({ 'date': date }) as unknown as Workout[];
        if (existing.length > 1) throw new Error(`the database contains two or more workouts with date ${date.toJSON()}`);

        const isUpdating = existing.length == 1;

        const exercises = isUpdating ? existing[0].exercises : {};
        body.exercises.forEach(exercise => {
            exercises[exercise.name] = exercise.sets;
        });
        const workout: Workout = { date: date, exercises: exercises };

        if (isUpdating) {
            await workouts.findOneAndUpdate({ 'date': date }, { $set: workout });
        } else {
            await workouts.insert(workout);
        }

        res.status(200).json({ 'message': 'success', 'workout': workout });
    } catch (error) {
        next(error);
    }
});

app.delete('/workouts', async (req, res, next) => {
    try {
        const body: DeleteReqBody = req.body;
        await validateDelete(body);

        let date = floorToDay(new Date(Date.parse(body.date)));

        const existing = await workouts.find({ 'date': date }) as unknown as Workout[];
        if (existing.length > 1) throw new Error(`the database contains two or more workouts with date ${date.toJSON()}`);
        if (existing.length == 0) throw new Error(`the database does not contain any workouts with date ${date.toJSON()}`);

        const workout = existing[0];

        if (body.exercises) {
            body.exercises.forEach(exercise => {
                if (workout.exercises[exercise] == undefined) throw new Error(`${exercise} did not exist in workout`);
                delete workout.exercises[exercise];
            });
            if (Object.entries(workout.exercises).length === 0) {
                await workouts.findOneAndDelete({ 'date': date });
                res.status(200).json({'message': 'success', 'currentWorkout': 'DELETED'});
            } else {
                await workouts.findOneAndUpdate({ 'date': date }, { $set: workout });
                res.status(200).json({ 'message': 'success', 'currentWorkout': workout });
            }
            return;
        } else {
            await workouts.findOneAndDelete({ 'date': date });
            res.status(200).json({'message': 'success', 'currentWorkout': 'DELETED'});
        }
    } catch (error) {
        next(error);
    }
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(`error: ${error.message}`);
    res.status(500).json({ error: error.message });
});