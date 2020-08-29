import * as stringUtils from './string_utils';

export function floorToDay(date: Date): Date {
    let dateString = `${date.getFullYear()}`;
    dateString += `-${stringUtils.padLeft(date.getMonth() + 1)}`;
    dateString += `-${stringUtils.padLeft(date.getDate())}`;
    return new Date(Date.parse(dateString));
}

export function getDayFromString(string: string): Date {
    return floorToDay(new Date(Date.parse(string)));
}