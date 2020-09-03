import { months } from './string_utils';
import { padLeft } from './string_utils';
import { api } from '../client';
import { floorToMonth, copyDate } from './date_utils';

export class Calendar {
    private selectedMonth = floorToMonth(new Date());

    constructor(private onChange: Function) { }

    get monthString(): string {
        return months[this.selectedMonth.getMonth()];
    }

    get year(): number {
        return this.selectedMonth.getFullYear();
    }

    get indentAmount(): number {
        return this.selectedMonth.getDay() - 1;
    }

    get daysInMonth(): number {
        const lastDate = copyDate(this.selectedMonth);
        lastDate.setMonth(lastDate.getMonth() + 1);
        lastDate.setDate(0);
        return lastDate.getDate();
    }

    get inTodaysMonth(): boolean {
        return new Date().getMonth() === this.selectedMonth.getMonth();
    }

    async changeMonth(change: number): Promise<void> {
        if (change % 1 != 0) throw new Error('change must be a whole number');
        this.selectedMonth.setMonth(this.selectedMonth.getMonth() + change);

        const currentMonth = floorToMonth(this.selectedMonth);
        currentMonth.setDate(this.daysInMonth);
        await api.updateData(currentMonth);

        this.onChange();
    }

    trainedOn(dayIndex: number): boolean {
        const month = this.selectedMonth.getMonth() + 1;
        const dateString = `${this.year}-${padLeft(month)}-${padLeft(dayIndex)}`

        const workouts = api.workouts!;
        for (const workout of workouts) {
            if (workout.date.startsWith(dateString)) return true;
        }
        return false;
    }
}