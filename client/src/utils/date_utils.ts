export function floorToMonth(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth()));
}