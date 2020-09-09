import { Api } from './utils/api';
import { ModeNavigation } from './utils/mode_navigation';
import { hide, show } from './utils/dom_utils';
import { showCharts } from './routes/charts';
import { showCalendar } from './routes/calendar';
import { showTables } from './routes/tables';

export const mainContainer = document.querySelector('.main-container')! as HTMLDivElement;
const loadingElement = document.querySelector('.loading')! as HTMLDivElement;
const errorElement = document.querySelector('.error')! as HTMLDivElement;

export const api = new Api(
    () => {
        hide(loadingElement);
        showData();
    },
    (error: Error) => {
        hide(loadingElement);
        mainContainer.innerHTML = '';
        errorElement.querySelector('.error-message')!.textContent = error.message;
        show(errorElement);
    }
);

const modeNavigation = new ModeNavigation(showData);

export function showData() {
    if (api.workouts!.length == 0) {
        errorElement.querySelector('.error-message')!.textContent = 'the database is probably empty';
        show(errorElement);
        return;
    }

    mainContainer.innerHTML = '';

    switch (modeNavigation.mode) {
        case 'tables': {
            showTables();
            break;
        }
        case 'charts': {
            showCharts();
            break;
        }
        case 'calendar': {
            showCalendar();
            break;
        }
    }
}