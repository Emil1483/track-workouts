import { Api } from './utils/api';
import { ModeNavigation } from './utils/mode_navigation';
import { hide, show } from './utils/dom_utils';
import { combine } from './utils/array_utils';
import { format, formatDateString, formatSetField } from './utils/string_utils';

const mainContainer = document.querySelector('.main-container')! as HTMLDivElement;
const loadingElement = document.querySelector('.loading')! as HTMLDivElement;
const errorElement = document.querySelector('.error')! as HTMLDivElement;

const api = new Api(
    () => {
        hide(loadingElement);
        showData();
    },
    (error: Error) => {
        hide(loadingElement);
        errorElement.querySelector('.error-message')!.textContent = error.message;
        show(errorElement);
    }
);

const modeNavigation = new ModeNavigation(showData);

function showData() {
    switch (modeNavigation.mode) {
        case 'tables': {
            showTables();
            break;
        }
        case 'graphs': {
            showGraphs();
            break;
        }
        case 'calendar': {
            showCalendar();
            break;
        }
    }
}

function showGraphs() {
    mainContainer.innerHTML = '';
}

function showCalendar() {
    mainContainer.innerHTML = '';

    const workoutsCalendar = document.createElement('div');
    workoutsCalendar.className = 'workouts-calendar';

    const month = document.createElement('div');
    month.className = 'month';
    const a1 = document.createElement('a');
    a1.innerHTML = "&#10094;";

    const date = document.createElement('p');
    const monthDate = document.createElement('strong');
    const br = document.createElement('br');
    monthDate.textContent = "September"
    date.append(monthDate, br, "2020");

    const a2 = document.createElement('a');
    a2.innerHTML = "&#10095;";

    month.appendChild(a1);
    month.appendChild(date);
    month.appendChild(a2);

    workoutsCalendar.appendChild(month);

    const weekdays = document.createElement('div');
    weekdays.className = 'weekdays';
    ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach(weekday => {
        const weekdayElement = document.createElement('p');
        weekdayElement.textContent = weekday;
        weekdays.appendChild(weekdayElement);
    });

    workoutsCalendar.appendChild(weekdays);

    const days = document.createElement('div');
    days.className = 'days';
    [...Array(31).keys()].forEach(day => {
        const dayBox = document.createElement('div');
        dayBox.className = 'day-box';

        const dayNumber = document.createElement('p');
        dayNumber.textContent = day.toString();
        dayBox.appendChild(dayNumber);

        if (Math.random() < 0.8) dayBox.classList.add('trained');
        days.appendChild(dayBox);
    });

    workoutsCalendar.appendChild(days);

    mainContainer.appendChild(workoutsCalendar);
}

function showTables() {
    mainContainer.innerHTML = '';
    api.workoutsData!.workouts.forEach(workout => {
        const workoutTables = document.createElement('div');
        workoutTables.className = 'workouts-tables';

        const exerciseDate = document.createElement('h2');
        exerciseDate.className = 'workout-date';
        exerciseDate.textContent = formatDateString(workout.date);
        workoutTables.appendChild(exerciseDate);

        const exercisesNames = Object.keys(workout.exercises);
        exercisesNames.forEach(exerciseName => {
            const sets = workout.exercises[exerciseName];
            let allSetFields: string[] = [];
            sets.forEach(set => {
                const setFields = Object.keys(set);
                allSetFields = combine(allSetFields, setFields);
            });

            const exerciseElement = document.createElement('div');
            exerciseElement.className = 'exercise';

            const nameElement = document.createElement('h3');
            nameElement.className = 'exercise-name'
            nameElement.textContent = format(exerciseName);
            exerciseElement.appendChild(nameElement);

            const table = document.createElement('table');

            const thead = document.createElement('thead');
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = 'Set';
            tr.appendChild(th);
            allSetFields.forEach(setField => {
                const th = document.createElement('th');
                th.textContent = format(setField);
                tr.appendChild(th);
            });
            thead.appendChild(tr);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');

            for (let i = 0; i < sets.length; i++) {
                const set = sets[i];
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.textContent = `${i + 1}`;
                tr.appendChild(td);
                allSetFields.forEach(setField => {
                    const td = document.createElement('td');
                    td.textContent = formatSetField(set, setField);
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);

            exerciseElement.appendChild(table);
            workoutTables.appendChild(exerciseElement);
        });

        mainContainer.appendChild(workoutTables);
    });
}