import { Api } from './utils/api';
import { ModeNavigation } from './utils/mode_navigation';
import { hide, show } from './utils/dom_utils';
import { showCharts } from './routes/charts';
import { showCalendar } from './routes/calendar';
import { showTables } from './routes/tables';
import { showDetails } from './routes/details';

export const mainContainer = document.querySelector('.main-container')! as HTMLDivElement;
export const loadingElement = document.querySelector('.loading')! as HTMLDivElement;
const errorElement = document.querySelector('.error')! as HTMLDivElement;

export const modeNavigation = new ModeNavigation(showData);

export const api = new Api(
    showData,
    (error: Error) => {
        hide(loadingElement);
        mainContainer.innerHTML = '';
        errorElement.querySelector('.error-message')!.textContent = error.message;
        show(errorElement);
    },
);

export function showData() {
    if (api.workouts!.length == 0) {
        errorElement.querySelector('.error-message')!.textContent = 'the database is probably empty';
        show(errorElement);
        return;
    }

    hide(errorElement);

    mainContainer.innerHTML = '';

    if (typeof modeNavigation.mode == 'object') {
        showDetails();
        return;
    }

    hide(loadingElement);
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