export function floorToMonth(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth()));
}

export function floorToDay(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function getCurrentDate(): number {
    const today = floorToDay(new Date());
    return today.getDate();
}

export function copyDate(date: Date): Date {
    return new Date(date.valueOf());
}