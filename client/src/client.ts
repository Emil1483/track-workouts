import { BorderWidth, Chart, Point, ChartColor } from 'chart.js';

import { Api } from './utils/api';
import { ModeNavigation } from './utils/mode_navigation';
import { hide, show } from './utils/dom_utils';
import { combine } from './utils/array_utils';
import { format, formatDateString, formatSetField } from './utils/string_utils';
import { Calendar } from './utils/calendar';
import { floorToDay, getCurrentDate, floorToMonth } from './utils/date_utils';

const mainContainer = document.querySelector('.main-container')! as HTMLDivElement;
const loadingElement = document.querySelector('.loading')! as HTMLDivElement;
const errorElement = document.querySelector('.error')! as HTMLDivElement;

export const api = new Api(
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

const calendar = new Calendar(showCalendar);

function showData() {
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

function showCharts() {
    mainContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    mainContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['group 1', 'group 2'],
            datasets: [
                {
                    backgroundColor: '#000000',
                    hoverBackgroundColor: ctx.createLinearGradient(0, 0, 0, 100),
                    hoverBorderColor: ctx.createLinearGradient(0, 0, 0, 100),
                    borderWidth: 1,
                    label: 'test',
                    data: [1, 2, 3],
                },
                {
                    backgroundColor: '#ff0000',
                    borderWidth: { top: 1, right: 1, bottom: 0, left: 1 },
                    label: 'test',
                    data: [1, 3, 5],
                    barThickness: 'flex',
                    minBarLength: 2,
                }
            ],
        },
        options: {
            hover: {
                axis: 'xy',
                mode: 'nearest',
                animationDuration: 400,
                intersect: true,
            },
            onHover(ev: MouseEvent, points: any[]) {
                return;
            },
            title: {
                text: ['foo', 'bar'],
            },
            tooltips: {
                filter: data => Number(data.yLabel) > 0,
                intersect: true,
                mode: 'index',
                itemSort: (a, b, data) => Math.random() - 0.5,
                position: 'average',
                caretPadding: 2,
                displayColors: true,
                borderColor: 'rgba(0,0,0,0)',
                borderWidth: 1,
                titleAlign: 'center',
                callbacks: {
                    title: ([point]) => (point.label ? point.label.substring(0, 2) : 'title'),
                    label(tooltipItem) {
                        const { value, x, y, label } = tooltipItem;
                        return `${label}(${x}, ${y}) = ${value}`;
                    },
                },
            },
            scales: {
                xAxes: [
                    {
                        ticks: {
                            callback: (value) => {
                                if (value === 10) {
                                    return Math.floor(value);
                                }

                                if (value === 20) {
                                    return `${value}`;
                                }

                                if (value === 30) {
                                    return undefined;
                                }

                                return null;
                            },
                            sampleSize: 10,
                        },
                        gridLines: {
                            display: false,
                            borderDash: [5, 15],
                            borderDashOffset: 2,
                            zeroLineBorderDash: [5, 15],
                            zeroLineBorderDashOffset: 2,
                            lineWidth: [1, 2, 3],
                        },
                    },
                ],
            },
            legend: {
                align: 'center',
                display: true,
                labels: {
                    usePointStyle: true,
                    padding: 40,
                },
            },
            devicePixelRatio: 2,
            plugins: {
                bar: false,
                foo: {},
            },
        },
    });
}

function showCalendar() {
    mainContainer.innerHTML = '';

    const workoutsCalendar = document.createElement('div');
    workoutsCalendar.className = 'workouts-calendar';

    const month = document.createElement('div');
    month.className = 'month';
    const leftArrow = document.createElement('a');
    leftArrow.innerHTML = "&#10094;";

    const date = document.createElement('p');
    const monthDate = document.createElement('strong');
    const br = document.createElement('br');
    monthDate.textContent = calendar.monthString;
    date.append(monthDate, br, calendar.year.toString());

    const rightArrow = document.createElement('a');
    rightArrow.innerHTML = "&#10095;";

    leftArrow.onclick = () => calendar.changeMonth(-1);
    rightArrow.onclick = () => calendar.changeMonth(1);

    month.appendChild(leftArrow);
    month.appendChild(date);
    month.appendChild(rightArrow);

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

    for (let i = 0; i < calendar.indentAmount; i++) {
        const emptyBox = document.createElement('div');
        emptyBox.className = 'empty-box';
        days.appendChild(emptyBox);
    }

    const todaysDate = getCurrentDate();

    for (let dayIndex = 1; dayIndex <= calendar.daysInMonth; dayIndex++) {
        const dayBox = document.createElement('div');
        dayBox.className = 'day-box';

        const dayNumber = document.createElement('p');
        dayNumber.textContent = dayIndex.toString();
        dayBox.appendChild(dayNumber);

        if (calendar.trainedOn(dayIndex)) dayBox.classList.add('trained');
        if (calendar.inTodaysMonth && dayIndex === todaysDate) dayBox.classList.add('today');

        days.appendChild(dayBox);
    }

    workoutsCalendar.appendChild(days);

    mainContainer.appendChild(workoutsCalendar);
}

function showTables() {
    mainContainer.innerHTML = '';
    api.workouts!.forEach(workout => {
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

    const button = document.createElement('button') as HTMLButtonElement;
    button.className = 'load-more-btn';
    if (api.gotAllData) {
        button.style.visibility = 'hidden';
    }
    button.textContent = 'Show More';
    button.addEventListener('click', async () => {
        button.classList.add('disabled-btn');
        await api.loadMoreData();
        showTables();
    })
    mainContainer.appendChild(button);

}