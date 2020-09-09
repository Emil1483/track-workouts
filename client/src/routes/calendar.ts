import { mainContainer } from "../client";
import { Calendar } from "../utils/calendar";
import { getCurrentDate } from "../utils/date_utils";

const calendar = new Calendar(showCalendar);

export function showCalendar() {
    const workoutsCalendar = document.createElement('div');
    workoutsCalendar.className = 'workouts-calendar';

    const month = document.createElement('div');
    month.className = 'month';
    const leftArrow = document.createElement('a');
    leftArrow.innerHTML = "&#10094;";

    const date = document.createElement('p');
    const monthDate = document.createElement('strong');
    const br = document.createElement('br');
    monthDate.textContent = calendar.monthString;
    date.append(monthDate, br, calendar.year.toString());

    const rightArrow = document.createElement('a');
    rightArrow.innerHTML = "&#10095;";

    leftArrow.onclick = () => calendar.changeMonth(-1);
    rightArrow.onclick = () => calendar.changeMonth(1);

    month.appendChild(leftArrow);
    month.appendChild(date);
    month.appendChild(rightArrow);

    workoutsCalendar.appendChild(month);

    const weekdays = document.createElement('div');
    weekdays.className = 'weekdays';
    ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach(weekday => {
        const weekdayElement = document.createElement('p');
        weekdayElement.textContent = weekday;
        weekdays.appendChild(weekdayElement);
    });

    workoutsCalendar.appendChild(weekdays);

    const days = document.createElement('div');
    days.className = 'days';

    for (let i = 0; i < calendar.indentAmount; i++) {
        const emptyBox = document.createElement('div');
        emptyBox.className = 'empty-box';
        days.appendChild(emptyBox);
    }

    const todaysDate = getCurrentDate();

    for (let dayIndex = 1; dayIndex <= calendar.daysInMonth; dayIndex++) {
        const dayBox = document.createElement('div');
        dayBox.className = 'day-box';

        const dayNumber = document.createElement('p');
        dayNumber.textContent = dayIndex.toString();
        dayBox.appendChild(dayNumber);

        if (calendar.trainedOn(dayIndex)) dayBox.classList.add('trained');
        if (calendar.inTodaysMonth && dayIndex === todaysDate) dayBox.classList.add('today');

        days.appendChild(dayBox);
    }

    workoutsCalendar.appendChild(days);

    mainContainer.appendChild(workoutsCalendar);
}