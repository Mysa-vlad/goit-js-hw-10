import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const refs = {
  input: document.querySelector('#datetime-picker'),
  startBtn: document.querySelector('[data-start]'),
  days: document.querySelector('[data-days]'),
  hours: document.querySelector('[data-hours]'),
  minutes: document.querySelector('[data-minutes]'),
  seconds: document.querySelector('[data-seconds]'),
};

let userSelectedDate = null;
let timerId = null;

refs.startBtn.disabled = true;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    const selectedDate = selectedDates[0];

    if (!selectedDate) {
      refs.startBtn.disabled = true;
      userSelectedDate = null;
      return;
    }

    const now = Date.now();

    if (selectedDate.getTime() <= now) {
      refs.startBtn.disabled = true;
      userSelectedDate = null;
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topRight',
      });
      return;
    }

    userSelectedDate = selectedDate;
    refs.startBtn.disabled = false;
  },
};

flatpickr(refs.input, options);

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function convertMs(ms) {
  // Number of milliseconds per unit of time
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Remaining days
  const days = Math.floor(ms / day);
  // Remaining hours
  const hours = Math.floor((ms % day) / hour);
  // Remaining minutes
  const minutes = Math.floor(((ms % day) % hour) / minute);
  // Remaining seconds
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

function updateTimer({ days, hours, minutes, seconds }) {
  refs.days.textContent = addLeadingZero(days);
  refs.hours.textContent = addLeadingZero(hours);
  refs.minutes.textContent = addLeadingZero(minutes);
  refs.seconds.textContent = addLeadingZero(seconds);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  refs.input.disabled = false;
  refs.startBtn.disabled = true;
}

function startTimer() {
  if (!userSelectedDate) {
    return;
  }

  refs.startBtn.disabled = true;
  refs.input.disabled = true;

  const tick = () => {
    const delta = userSelectedDate.getTime() - Date.now();

    if (delta <= 0) {
      updateTimer(convertMs(0));
      stopTimer();
      return;
    }

    updateTimer(convertMs(delta));
  };

  tick();
  timerId = setInterval(tick, 1000);
}

refs.startBtn.addEventListener('click', startTimer);

