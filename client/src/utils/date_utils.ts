export function floorToMonth(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth()));
}

export function floorToDay(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - 1));
}

export function getCurrentDate(): number {
    const today = floorToDay(new Date());
    return today.getDate();
}

export function copyDate(date: Date): Date {
    return new Date(date.valueOf());
}

export function daysFromToday(date: Date): number {
    let today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    today = floorToDay(today);
    const diffInMilliseconds = today.getTime() - date.getTime();
    return diffInMilliseconds / (1000 * 60 * 60 * 24);
}