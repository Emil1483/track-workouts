import { combine } from "./array_utils";

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
        [exercise: string]: Array<{
            [setField: string]: any;
        }>;
    };
}>;

export class Api {
    private _workouts: Workouts | null;
    private visitedMonths: { [date: string]: boolean } = {};

    constructor(public onSuccess: Function, public onFailure: (error: Error) => void) {
        this._workouts = null;
        this.getData();
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

    async updateData(to: Date): Promise<void> {
        if (this.visitedMonths[to.toJSON()]) return;
        this.visitedMonths[to.toJSON()] = true;

        const response = await fetch(`${APP_URL}/workouts?to=${to.toJSON()}`);
        const data = await response.json() as WorkoutsData;
        this._workouts = combine(this._workouts!, data.workouts, (obj1, obj2) => obj1._id === obj2._id);
    }
}