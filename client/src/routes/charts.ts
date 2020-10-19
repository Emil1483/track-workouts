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

interface Charts {
    [exerciseName: string]: Chart;
}

let charts: Charts = {};

Chart.defaults.global.defaultFontFamily = 'Proxima';
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.global.defaultFontColor = '#d3d0ca';
const colors = [
    ['#FA5D3E', '#b5442d', '#752c1d', '#63362d'],
    ['#4aa4ff', '#3574b5', '#2b4d70', '#30455c'],
];
const ignore = ['bodyMass', 'preBreak'];
const important = ['reps', 'time'];

export function showCharts() {
    addLoadMoreButton('Load More Data', async button => {
        const appendedData = await api.loadMoreData();
        if (appendedData == null) return;
        if (appendedData.length == 0) {
            button.style.visibility = 'hidden';
            return;
        }
        const graphableExercises = parseGraphableExercises();
        for (const name in graphableExercises) {
            const exerciseData = graphableExercises[name];
            const chartData = getChartDataFrom(exerciseData);

            charts[name].data.datasets! = chartData.datasets;
            charts[name].data.labels! = chartData.labels;
            charts[name].update();
        }
    });

    const graphableExercises = parseGraphableExercises();

    for (const name in graphableExercises) {
        const exerciseData = graphableExercises[name];

        const setAttributeNames = getSetAttributeNames(exerciseData);

        const canvas = document.createElement('canvas');
        canvas.width, canvas.height = 400;
        mainContainer.appendChild(canvas);
        const ctx = canvas.getContext('2d')!;

        charts[name] = new Chart(ctx, {
            type: 'line',
            data: getChartDataFrom(exerciseData),
            options: {
                title: {
                    display: true,
                    text: name,
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
                            labelString: 'Days ago from today',
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
                                labelString: getAxisLabel(setAttributeNames, true),
                            },
                        },
                        {
                            id: 'B',
                            type: 'linear',
                            position: 'right',
                            scaleLabel: {
                                display: true,
                                labelString: getAxisLabel(setAttributeNames, false),
                            }
                        }
                    ],
                },
            },
        });
    }
}

function getAxisLabel(setAttributeNames: string[], leftAxis: boolean): string {
    const filtered = setAttributeNames
        .filter(name => shouldBeOnLeftAxis(name) == leftAxis);

    if (filtered.length == 0) return '';

    return filtered
        .map(name => format(name))
        .reduce((a, b) => a + ', ' + b);
}

function getChartDataFrom(exerciseData: GraphableExercisesSets) {
    const setAttributeNames = getSetAttributeNames(exerciseData);
    const graphableSets = getGraphableSets(exerciseData, setAttributeNames);
    return {
        datasets: graphableSets
            .map(set => setAttributeNames.map(name => {
                const index = graphableSets.indexOf(set);
                const possibleColors = colors[setAttributeNames.indexOf(name)]
                    ?? colors[colors.length - 1];
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
                    pointRadius: 8 / (index + 2),
                    borderWidth: 2,
                }
            })).reduce((a, b) => combine(a, b)),
        labels: exerciseData.map(data => daysFromToday(data.date)),
    };
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
    for (const index in important) {
        if (name == important[index]) return true;
    }
    return false;
}