import { BorderWidth, Chart, Point, ChartColor } from 'chart.js';

import { Api, Sets } from './utils/api';
import { ModeNavigation } from './utils/mode_navigation';
import { hide, show } from './utils/dom_utils';
import { combine } from './utils/array_utils';
import { format, formatDateString, formatSetField } from './utils/string_utils';
import { Calendar } from './utils/calendar';
import { floorToDay, getCurrentDate, floorToMonth, daysFromToday } from './utils/date_utils';

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
    if (api.workouts!.length == 0) {
        errorElement.querySelector('.error-message')!.textContent = 'the database is probably empty';
        show(errorElement);
        return;
    }

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

interface GraphableExercises {
    [name: string]: Array<{
        date: Date;
        sets: Sets;
    }>
}

interface GraphableSet {
    [setAttributeName: string]: Array<number>;
}

function shouldBeOnLeftAxis(name: string) {
    return name == 'reps' || name == 'time';
}

function showCharts() {
    mainContainer.innerHTML = '';

    addLoadMoreButton('Load More Data');

    Chart.defaults.global.defaultFontFamily = 'Roboto';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = '#CCC';
    const colors = [
        ['#DD00D6', '#D863D6', '#D698D5', '#D698D5'],
        ['#005DD8', '#4483D6', '#7AA1D3', '#9CB4D1'],
    ];
    const ignore = ['bodyMass', 'preBreak'];

    const graphableExercises: GraphableExercises = {};
    api.workouts!.forEach(workout => {
        for (const name in workout.exercises) {
            let sets = workout.exercises[name]
                .map(set => {
                    const copy = Object.assign({}, set);
                    ignore.forEach(attribute => delete (copy as any)[attribute]);
                    return copy;
                });

            if (graphableExercises[name] == null) graphableExercises[name] = [];
            graphableExercises[name].push({
                date: new Date(Date.parse(workout.date)),
                sets: sets,
            });
        }
    });
    for (const name in graphableExercises) {
        graphableExercises[name].sort(
            (a, b) => a.date.getTime() - b.date.getTime()
        );
    }
    for (const name in graphableExercises) {
        const exerciseData = graphableExercises[name];

        const canvas = document.createElement('canvas');
        canvas.width, canvas.height = 400;
        mainContainer.appendChild(canvas);

        const setAttributeNames = exerciseData
            .map(data =>
                data.sets.map(set => Object.keys(set)).reduce((a, b) => combine(a, b))
            )
            .reduce((a, b) => combine(a, b));
        const setsCount = exerciseData
            .map(data => data.sets.length)
            .reduce((a, b) => Math.max(a, b));

        const graphableSets: GraphableSet[] = [];
        exerciseData.forEach(dataForDay => {
            for (let i = 0; i < setsCount; i++) {
                if (i >= graphableSets.length) graphableSets.push({});
                const graphableSet = graphableSets[i];
                const set = dataForDay.sets[i] ?? {};

                setAttributeNames.forEach(setAttributeName => {
                    const setAttribute: number = (set as any)[setAttributeName] ?? null;

                    if (graphableSet[setAttributeName] == null) graphableSet[setAttributeName] = [];
                    graphableSet[setAttributeName].push(setAttribute);
                })
            }
        });

        const ctx = canvas.getContext('2d')!;
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: graphableSets
                    .map(set => setAttributeNames.map(name => {
                        const index = graphableSets.indexOf(set);
                        const possibleColors = colors[setAttributeNames.indexOf(name)];
                        const color = possibleColors[index]
                            ?? possibleColors[possibleColors.length - 1];
                        return {
                            label: index == 0 ? format(name) : 'remove',
                            data: set[name],
                            fill: false,
                            borderColor: color,
                            pointBackgroundColor: color,
                            yAxisID: shouldBeOnLeftAxis(name) ? 'A' : 'B',
                            showLine: index == 0,
                            pointRadius: 20 / (index + 3),
                        }
                    })).reduce((a, b) => combine(a, b)),
                labels: exerciseData.map(data => daysFromToday(data.date)),
            },
            options: {
                title: {
                    display: true,
                    text: format(name),
                    fontSize: 25,
                },
                legend: {
                    labels: {
                        filter: (item, chart) => item.text != 'remove',
                    },
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Days to Today',
                        },
                    }],
                    yAxes: [
                        {
                            id: 'A',
                            type: 'linear',
                            position: 'left',
                            scaleLabel: {
                                display: true,
                                labelString: setAttributeNames
                                    .filter(name => shouldBeOnLeftAxis(name))
                                    .map(name => format(name))
                                    .reduce((a, b) => a + ' ' + b),
                            },
                        },
                        {
                            id: 'B',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                labelString: setAttributeNames
                                    .filter(name => !shouldBeOnLeftAxis(name))
                                    .map(name => format(name))
                                    .reduce((a, b) => a + ', ' + b),
                            },
                        }
                    ],
                },
            },
        });
    }
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

    addLoadMoreButton();
}

function addLoadMoreButton(buttonText: string = 'Show More') {
    const button = document.createElement('button') as HTMLButtonElement;
    button.className = 'load-more-btn';
    if (api.gotAllData) {
        button.style.visibility = 'hidden';
    }
    button.textContent = buttonText;
    button.addEventListener('click', async () => {
        button.classList.add('disabled-btn');
        await api.loadMoreData();
        showData();
    })
    mainContainer.appendChild(button);
}