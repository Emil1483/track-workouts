import { Sets } from "../utils/api";
import { mainContainer, api } from "../client";
import { addLoadMoreButton } from "../utils/dom_utils";
import Chart from "chart.js";
import { combine } from "../utils/array_utils";
import { format } from "../utils/string_utils";
import { daysFromToday } from "../utils/date_utils";

interface GraphableExercises {
    [name: string]: GraphableExercisesSets;
}

type GraphableExercisesSets = Array<{
    date: Date;
    sets: Sets;
}>

interface GraphableSet {
    [setAttributeName: string]: Array<number>;
}

Chart.defaults.global.defaultFontFamily = 'Roboto';
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.global.defaultFontColor = '#CCC';
const colors = [
    ['#DD00D6', '#D863D6', '#D698D5', '#D698D5'],
    ['#005DD8', '#4483D6', '#7AA1D3', '#9CB4D1'],
];
const ignore = ['bodyMass', 'preBreak'];

export function showCharts() {
    addLoadMoreButton('Load More Data');

    const graphableExercises = parseGraphableExercises();

    for (const name in graphableExercises) {
        const exerciseData = graphableExercises[name];

        const setAttributeNames = getSetAttributeNames(exerciseData);
        const graphableSets = getGraphableSets(exerciseData, setAttributeNames);

        const canvas = document.createElement('canvas');
        canvas.width, canvas.height = 400;
        mainContainer.appendChild(canvas);
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
                            label: format(name) + (index == 0 ? '' : ` (Set #${index + 1})`),
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
                        filter: item => !item.text!.includes('Set'),
                    },
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Days ago from Today',
                        },
                        gridLines: {
                            display: true,
                            color: '#212121'
                        },
                    }],
                    yAxes: [
                        {
                            id: 'A',
                            type: 'linear',
                            position: 'left',
                            gridLines: {
                                display: true,
                                color: '#303030'
                            },
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

function parseGraphableExercises(): GraphableExercises {
    const result: GraphableExercises = {};

    api.workouts!.forEach(workout => {
        for (const name in workout.exercises) {
            let sets = workout.exercises[name]
                .map(set => {
                    const copy = Object.assign({}, set);
                    ignore.forEach(attribute => delete (copy as any)[attribute]);
                    return copy;
                });

            if (result[name] == null) result[name] = [];
            result[name].push({
                date: new Date(Date.parse(workout.date)),
                sets: sets,
            });
        }
    });

    for (const name in result) {
        result[name].sort(
            (a, b) => a.date.getTime() - b.date.getTime()
        );
    }

    return result;
}

function getSetAttributeNames(setsDatas: GraphableExercisesSets): string[] {
    return setsDatas.map(setsData =>
        setsData.sets.map(set => Object.keys(set)).reduce((a, b) => combine(a, b))
    ).reduce((a, b) => combine(a, b));
}

function getSetsCount(setsDatas: GraphableExercisesSets): number {
    return setsDatas
        .map(setsData => setsData.sets.length)
        .reduce((a, b) => Math.max(a, b));
}

function getGraphableSets(setsDatas: GraphableExercisesSets, setAttributeNames: string[]): GraphableSet[] {
    const result: GraphableSet[] = [];
    setsDatas.forEach(dataForDay => {
        for (let i = 0; i < getSetsCount(setsDatas); i++) {
            if (i >= result.length) result.push({});
            const graphableSet = result[i];
            const set = dataForDay.sets[i] ?? {};

            setAttributeNames.forEach(setAttributeName => {
                const setAttribute: number = (set as any)[setAttributeName] ?? null;

                if (graphableSet[setAttributeName] == null) graphableSet[setAttributeName] = [];
                graphableSet[setAttributeName].push(setAttribute);
            })
        }
    });
    return result;
}

function shouldBeOnLeftAxis(name: string) {
    return name == 'reps' || name == 'time';
}