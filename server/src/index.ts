import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { json } from 'body-parser';
import cors from 'cors';

import { PostReqBody, DeleteReqBody, validatePost, validateDelete, validateGetWorkouts, GetWorkoutsQuery } from './utils/validation';
import { getDayFromString } from './utils/date_utils';
import Workout from './utils/workout';
import { getWorkoutsFrom, deleteWorkout, updateWorkout, insertWorkout, getWorkouts, getWorkoutsCount } from './utils/database_utils';
import { tooManyWorkoutsExistsWith, noWorkoutsExistsWith, exerciseDoesNotExist } from './utils/error_utils';

const app = express();

app.use(cors());
app.use(morgan('tiny'));
app.use(json());

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));

app.get('/', (req, res) => {
    res.status(200).json({ 'message': '😀' });
});

app.get('/workouts', async (req, res, next) => {
    try {
        const options = await validateGetWorkouts(req.query as any);
        const [workouts, total] = await Promise.all([getWorkouts(options), getWorkoutsCount()]);
        console.log(workouts, total);
        res.status(200).json({ options: options, 'totalWorkouts': total, 'workouts': workouts });
    } catch (error) {
        next(error);
    }
});

app.post('/workouts', async (req, res, next) => {
    try {
        const body: PostReqBody = req.body;
        await validatePost(body);

        const date = getDayFromString(body.date);

        const existing = await getWorkoutsFrom(date);
        if (existing.length > 1) throw tooManyWorkoutsExistsWith(date);

        const isUpdating = existing.length == 1;

        const exercises = isUpdating ? existing[0].exercises : {};
        body.exercises.forEach(exercise => {
            exercises[exercise.name] = exercise.sets;
        });
        const workout: Workout = { date: date, exercises: exercises };

        if (isUpdating) {
            await updateWorkout(workout);
        } else {
            await insertWorkout(workout);
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

        const date = getDayFromString(body.date);

        const existing = await getWorkoutsFrom(date);
        if (existing.length > 1) throw tooManyWorkoutsExistsWith(date);
        if (existing.length == 0) throw noWorkoutsExistsWith(date);

        const workout = existing[0];

        if (body.exercises) {
            body.exercises.forEach(exercise => {
                if (workout.exercises[exercise] == undefined) throw exerciseDoesNotExist(exercise);
                delete workout.exercises[exercise];
            });
            if (Object.entries(workout.exercises).length > 0) {
                await updateWorkout(workout);
                res.status(200).json({ 'message': 'success', 'currentWorkout': workout });
                return;
            }
        }

        await deleteWorkout(date);
        res.status(200).json({ 'message': 'success', 'currentWorkout': 'DELETED' });
    } catch (error) {
        next(error);
    }
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(`error: ${error.message}`);
    res.status(500).json({ error: error.message });
});