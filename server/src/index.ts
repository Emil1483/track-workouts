import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { json } from 'body-parser';
import cors from 'cors';
import monk from 'monk';

import { ReqBody, validate } from './utils/validation';
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
        const body: ReqBody = req.body;
        await validate(body);

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

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(`error: ${error.message}`);
    res.status(500).json({ error: error.message });
});