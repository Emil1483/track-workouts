import { mainContainer, api, modeNavigation } from "../client";
import { Calendar } from "../utils/calendar";
import { getCurrentDate } from "../utils/date_utils";

const calendar = new Calendar(() => {
    mainContainer.innerHTML = '';
    showCalendar();
});

export function showCalendar() {
    const workoutsCalendar = document.createElement('div');
    workoutsCalendar.className = 'workouts-calendar';

    const month = document.createElement('div');
    month.className = 'month';

    const date = document.createElement('p');
    const monthDate = document.createElement('strong');
    const br = document.createElement('br');
    monthDate.textContent = calendar.monthString;
    date.append(monthDate, br, calendar.year.toString());

    const leftArrow = document.createElement('a');
    leftArrow.innerHTML = "&#10094;";

    const rightArrow = document.createElement('a');
    rightArrow.innerHTML = "&#10095;";
    if (calendar.isOnCurrentMonth) {
        rightArrow.classList.add('disabled');
    } else {
        rightArrow.onclick = async () => {
            rightArrow.classList.add('disabled');
            await calendar.changeMonth(1);
            rightArrow.classList.remove('disabled');
        }
    }

    leftArrow.onclick = async () => {
        leftArrow.classList.add('disabled');
        await calendar.changeMonth(-1);
        leftArrow.classList.remove('disabled');
    }

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

        if (calendar.trainedOn(dayIndex)) {
            dayBox.classList.add('trained');
            const selectedMonth = calendar.selectedMonth;
            selectedMonth.setDate(dayIndex);
            dayBox.onclick = () => {
                const workout = api.getWorkoutByDate(selectedMonth);
                const id = workout!._id;
                modeNavigation.changeMode({id: id});
            };
        }
        if (calendar.inTodaysMonth && dayIndex === todaysDate.getDate()) dayBox.classList.add('today');

        days.appendChild(dayBox);
    }

    workoutsCalendar.appendChild(days);

    mainContainer.appendChild(workoutsCalendar);
}