import monk from 'monk';

import Workout from './workout';
import { GetWorkoutsQuery } from './validation';
import { floorToDay } from './date_utils';

const db = monk('localhost/track-workouts');
const workouts = db.get('workouts');

export async function getWorkoutsFrom(date: Date): Promise<Workout[]> {
    return await workouts.find({ 'date': date }) as unknown as Workout[];
}

export async function updateWorkout(workout: Workout) {
    await workouts.findOneAndUpdate({ 'date': workout.date }, { $set: workout });
}

export async function deleteWorkout(date: Date) {
    await workouts.findOneAndDelete({ 'date': date });
}

export async function insertWorkout(workout: Workout) {
    await workouts.insert(workout);
}

export async function getWorkouts(options: GetWorkoutsQuery): Promise<Workout[]> {
    return await workouts.find(options.to == null ? {} : {
        date: {
            '$lte': floorToDay(options.to),
        },
    }, {
        limit: options.limit,
        sort: { date: options.sort === 'ascending' ? 1 : -1 }
    }) as unknown as Workout[];
}

export async function getWorkoutsCount() {
    return await workouts.count();
}