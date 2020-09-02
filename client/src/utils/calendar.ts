import { months } from './string_utils';

export class Calendar {
    private selectedMonth = new Date();

    constructor(private onChange: Function) { }

    get monthString(): string {
        return months[this.selectedMonth.getMonth()];
    }

    get year(): number {
        return this.selectedMonth.getFullYear();
    }

    changeMonth(change: number): void {
        if (change % 1 != 0) throw new Error('change must be a whole number');
        this.selectedMonth.setMonth(this.selectedMonth.getMonth() + change);
        this.onChange();
    }
}