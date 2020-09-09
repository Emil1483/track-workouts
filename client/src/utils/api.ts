import { combine } from "./array_utils";
import { Calendar } from "./calendar";

const APP_URL = 'http://localhost:5000';

export interface WorkoutsData {
    options: {
        limit: number;
        sort: 'ascending' | 'descending';
    };
    totalWorkouts: number;
    workouts: Workouts;
}

export type Workouts = Array<{
    _id: string;
    date: string;
    exercises: {
        [exercise: string]: Sets;
    };
}>;

export type Sets = Array<{
    [setField in 'reps' | 'weight' | 'preBreak' | 'bodyMass' | 'bandLevel' | 'time']: number;
}>;

export class Api {
    private _workouts: Workouts | null;
    private visitedMonths: { [date: string]: boolean } = {};
    private _gotAllData = false;

    constructor(private onSuccess: Function, private onFailure: (error: Error) => void) {
        this._workouts = null;
        this.getData();
    }

    get gotAllData(): boolean {
        return this._gotAllData;
    }

    get workouts(): Workouts | null {
        if (this._workouts == null) return null;
        return Object.assign(this._workouts);
    }

    async getData(): Promise<void> {
        try {
            const response = await fetch(`${APP_URL}/workouts`);
            const data = await response.json() as WorkoutsData;
            this._workouts = data.workouts;
            this.onSuccess();
        } catch (error) {
            console.log(error);
            this.onFailure(error);
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

    async updateData(to: Date): Promise<void> {
        if (this.visitedMonths[to.toJSON()]) return;
        if (this._gotAllData) return;

        this.visitedMonths[to.toJSON()] = true;

        const response = await fetch(`${APP_URL}/workouts?to=${to.toJSON()}`);
        const data = await response.json() as WorkoutsData;
        this.appendWorkouts(data.workouts);
    }

    async loadMoreData(): Promise<Workouts> {
        if (this._gotAllData) {
            return [];
        }

        const lastWorkout = this._workouts![this._workouts!.length - 1];
        if (lastWorkout == null) {
            this._gotAllData = true;
            return [];
        }

        const toDate = lastWorkout.date;
        const response = await fetch(`${APP_URL}/workouts?to=${toDate}`);

        const data = await response.json() as WorkoutsData;
        const workouts = data.workouts;

        const appendedWorkouts = this.appendWorkouts(workouts);
        this._gotAllData = appendedWorkouts.length == 0;
        return appendedWorkouts;
    }
}