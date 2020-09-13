import { combine } from "./array_utils";

// const APP_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://track-workouts.vercel.app';
const APP_URL = 'https://track-workouts.vercel.app';

export interface WorkoutsData {
    options: {
        limit: number;
        sort: 'ascending' | 'descending';
    };
    totalWorkouts: number;
    workouts: Workouts;
}

export type Workouts = Array<Workout>;

export interface Workout {
    _id: string;
    date: string;
    exercises: {
        [exercise: string]: Sets;
    };
}

export type Sets = Array<{
    [setField in 'reps' | 'weight' | 'preBreak' | 'bodyMass' | 'bandLevel' | 'time']: number;
}>;

export class Api {
    private _workouts: Workouts | null = null;
    private _gotAllData = false;

    constructor(private onSuccess: Function, private onFailure: (error: Error) => void) {
        this.getData();
    }

    get gotAllData(): boolean {
        return this._gotAllData;
    }

    get workouts(): Workouts | null {
        if (this._workouts == null) return null;
        return Object.assign(this._workouts);
    }

    private async fetch(url: string): Promise<any> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not get data: ${await response.text()}`);
        return await response.json();
    }

    private async getData(): Promise<void> {
        try {
            const data = await this.fetch(`${APP_URL}/workouts`) as WorkoutsData;
            this._workouts = data.workouts;
            if (this._workouts!.length == 0) {
                throw new Error('the database is probably empty');
            }
            this.onSuccess();
        } catch (error) {
            console.log(error);
            this.onFailure(error);
        }
    }

    getWorkoutByDate(date: Date): Workout | null {
        for (const name in this._workouts!) {
            const workout = this._workouts![name];
            if (workout.date == date.toJSON()) return workout;
        }
        return null;
    }

    async getWorkoutById(id: string): Promise<Workout | null> {
        for (const name in this._workouts!) {
            const workout = this._workouts![name];
            if (workout._id == id) return workout;
        }

        try {
            const workout = await this.fetch(`${APP_URL}/workouts/${id}`) as Workout;
            this.appendWorkouts([workout]);
            return workout;
        } catch (error) {
            console.log(error);
            this.onFailure(error);
            return null;
        }
    }

    private appendWorkouts(workouts: Workouts): Workouts {
        const oldWorkoutIds = this._workouts!.map(workout => workout._id);

        this._workouts = combine(this._workouts!, workouts, (a, b) => a._id === b._id);
        return this._workouts.filter((workout) => {
            for (const index in oldWorkoutIds) {
                const id = oldWorkoutIds[index];
                if (workout._id === id) return false;
            }
            return true;
        });
    }

    async loadMoreData(to?: Date): Promise<Workouts | null> {
        if (this._gotAllData) {
            return [];
        }

        const lastWorkout = this._workouts![this._workouts!.length - 1];
        if (lastWorkout == null) {
            this._gotAllData = true;
            return [];
        }

        try {
            const toDate = to?.toJSON() ?? lastWorkout.date;
            const data = await this.fetch(`${APP_URL}/workouts?to=${toDate}`) as WorkoutsData;

            const workouts = data.workouts;

            const appendedWorkouts = this.appendWorkouts(workouts);
            this._gotAllData = appendedWorkouts.length == 0;
            return appendedWorkouts;
        } catch (error) {
            console.log(error);
            this.onFailure(error);
            return null;
        }
    }
}