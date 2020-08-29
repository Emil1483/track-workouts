export default interface Workout {
    date: Date,
    exercises: {
        [exercise: string]: object[]
    };
}