import { mainContainer, api } from "../client";
import { formatDateString, format, formatSetField } from "../utils/string_utils";
import { combine } from "../utils/array_utils";
import { addLoadMoreButton } from "../utils/dom_utils";
import { Workout } from "../utils/api";

export function showTables() {
    api.workouts!.forEach(workout =>
        mainContainer.appendChild(buildWorkoutTablesFor(workout))
    );

    addLoadMoreButton('Show More', async () => {
        await api.loadMoreData();
        mainContainer.innerHTML = '';
        showTables();
    });
}

export function buildWorkoutTablesFor(workout: Workout): HTMLDivElement {
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
        nameElement.textContent = exerciseName;
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

    return workoutTables;
}