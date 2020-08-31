const APP_URL = 'http://localhost:5000';

export interface WorkoutsData {
    options: {
        limit: number;
        sort: 'ascending' | 'descending';
    };
    totalWorkouts: number;
    workouts: Array<{
        _id: string;
        date: string;
        exercises: {
            [exercise: string]: Array<{
                [setField: string]: any;
            }>;
        };
    }>;
}

export class Api {
    private _workoutsData: WorkoutsData | null;

    constructor(public onSuccess: Function, public onFailure: (error: Error) => void) {
        this._workoutsData = null;
        this.getData();
    }

    get workoutsData(): WorkoutsData | null {
        if (this._workoutsData == null) return null;
        return Object.assign(this._workoutsData);
    }

    async getData(): Promise<void> {
        try {
            const response = await fetch(`${APP_URL}/workouts`);
            this._workoutsData = await response.json() as WorkoutsData;
            this.onSuccess();
        } catch (error) {
            console.log(error);
            this.onFailure(error);
        }
    }
}