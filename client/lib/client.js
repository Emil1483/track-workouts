"use strict";
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
const mainContainer = document.querySelector('.main-container');
function getData() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${APP_URL}/workouts`);
        const data = yield response.json();
        data.workouts.forEach(workout => {
            const workoutTables = document.createElement('div');
            workoutTables.className = 'workouts-tables';
            const exerciseDate = document.createElement('h2');
            exerciseDate.className = 'workout-date';
            exerciseDate.textContent = formatDateString(workout.date);
            workoutTables.appendChild(exerciseDate);
            const exercisesNames = Object.keys(workout.exercises);
            exercisesNames.forEach(exerciseName => {
                const sets = workout.exercises[exerciseName];
                let allSetFields = [];
                sets.forEach(set => {
                    const setFields = Object.keys(set);
                    allSetFields = combine(allSetFields, setFields);
                });
                const exerciseElement = document.createElement('div');
                exerciseElement.className = 'exercise';
                const nameElement = document.createElement('h3');
                nameElement.className = 'exercise-name';
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
    });
}
getData();
function combine(array1, array2) {
    const result = Array.from(array1);
    array2.forEach(element => {
        const index = result.indexOf(element);
        if (index == -1) {
            result.push(element);
        }
    });
    return result;
}
function format(string) {
    let result = '';
    for (let i = 0; i < string.length; i++) {
        const char = string.charAt(i);
        if (char === char.toUpperCase()) {
            result += ' ';
        }
        result += char;
    }
    result = result.charAt(0).toUpperCase() + result.substring(1);
    return result;
}
const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
function formatDateString(string) {
    const date = new Date(string);
    return `${months[date.getMonth()]} ${date.getDate()}th, ${date.getFullYear()}`;
}
function formatSetField(set, field) {
    if (set[field] == null)
        return '';
    let result = set[field];
    if (field === 'weight' || field === 'bodyMass')
        result = `${result} kg`;
    else if (field === 'time')
        result = `${result} sec`;
    else if (field === 'preBreak')
        result = `${(+result / 60).toFixed(1)} min`;
    return result;
}
