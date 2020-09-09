export function floorToMonth(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth()));
}

export function floorToDay(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function getCurrentDate(): Date {
    let today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    today = floorToDay(today);
    return today;
}

export function copyDate(date: Date): Date {
    return new Date(date.valueOf());
}

export function daysFromToday(date: Date): number {
    let today = getCurrentDate();
    const diffInMilliseconds = today.getTime() - date.getTime();
    return diffInMilliseconds / (1000 * 60 * 60 * 24);
}