export function padLeft(value: number): string {
    if (value % 1 != 0) throw new Error('value must be an integer');

    return (value < 10 ? '0' : '') + value.toFixed(0);
}