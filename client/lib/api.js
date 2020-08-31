var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const APP_URL = 'http://localhost:5000';
export class Api {
    constructor(onSuccess, onFailure) {
        this.onSuccess = onSuccess;
        this.onFailure = onFailure;
        this._workoutsData = null;
        this.getData();
    }
    get workoutsData() {
        if (this._workoutsData == null)
            return null;
        return Object.assign(this._workoutsData);
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${APP_URL}/workouts`);
                this._workoutsData = (yield response.json());
                this.onSuccess();
            }
            catch (error) {
                console.log(error);
                this.onFailure(error);
            }
        });
    }
}
