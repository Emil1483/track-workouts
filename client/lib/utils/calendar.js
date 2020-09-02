import { months } from './string_utils';
export class Calendar {
    constructor(onChange) {
        this.onChange = onChange;
        this.selectedMonth = new Date();
    }
    get monthString() {
        return months[this.selectedMonth.getMonth()];
    }
    get year() {
        return this.selectedMonth.getFullYear();
    }
    changeMonth(change) {
        if (change % 1 != 0)
            throw new Error('change must be a whole number');
        this.selectedMonth.setMonth(this.selectedMonth.getMonth() + change);
        this.onChange();
    }
}
//# sourceMappingURL=calendar.js.map