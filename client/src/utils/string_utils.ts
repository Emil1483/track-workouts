export function format(string: string): string {
    let result = '';
    for (let i = 0; i < string.length; i++) {
        const char = string.charAt(i);
        if (char === char.toUpperCase()) {
            result += ' ';
        }
        result += char
    }
    result = result.charAt(0).toUpperCase() + result.substring(1);
    return result;
}

export const months = [
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

export function formatDateString(string: string): string {
    const date = new Date(string);
    return `${months[date.getMonth()]} ${date.getDate()}th, ${date.getFullYear()}`;
}

export function formatSetField(set: any, field: string) {
    if (set[field] == null) return '';
    let result = set[field];

    if (field === 'weight' || field === 'bodyMass') result = `${result} kg`;
    else if (field === 'time') result = `${result} sec`;
    else if (field === 'preBreak') result = `${(+result / 60).toFixed(1)} min`;

    return result;
}

export function padLeft(value: number): string {
    if (value % 1 != 0) throw new Error('value must be an integer');

    return (value < 10 ? '0' : '') + value.toFixed(0);
}