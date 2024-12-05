/*CALENDARIO PARA PROGRAMAR ACTIVIDADES IMPORTANTES*/
const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentDate = new Date();

const updateCalendar = () => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthYearString = currentDate.toLocaleString('es-ES', {
    month: 'long',
    year: 'numeric'
  });
  monthYearElement.textContent = monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

  let datesHTML = '';

  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    const prevDate = new Date(currentYear, currentMonth, -i);
    datesHTML = `<div class="date inactive">${prevDate.getDate()}</div>` + datesHTML;
  }

  for (let i = 1; i <= lastDay; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const activeClass = date.toDateString() === new Date().toDateString() ? 'active' : '';
    datesHTML += `<div class="date ${activeClass}">${i}</div>`;
  }

  const remainingDays = 7 - ((firstDay + lastDay - 1) % 7 || 7);
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(currentYear, currentMonth + 1, i);
    datesHTML += `<div class="date inactive">${nextDate.getDate()}</div>`;
  }

  datesElement.innerHTML = datesHTML;
};

prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});

nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});

updateCalendar();
