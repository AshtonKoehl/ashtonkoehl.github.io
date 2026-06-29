const updateScroll = () => {
  document.body.style.setProperty('--scroll', window.scrollY);
};
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navBar = document.getElementById('navBar');
const headerActions = document.querySelector('.header-actions');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');

const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const setTheme = (mode) => {
  if (mode === 'light') {
    document.documentElement.classList.add('light-mode');
    themeToggle.textContent = '🌙';
    themeColorMeta?.setAttribute('content', '#f4f5fb');
  } else {
    document.documentElement.classList.remove('light-mode');
    themeToggle.textContent = '☀️';
    themeColorMeta?.setAttribute('content', '#1b1f35');
  }
  localStorage.setItem('theme', mode);
};

const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
setTheme(currentTheme);

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.classList.contains('light-mode') ? 'dark' : 'light';
  setTheme(nextTheme);
});

const setMenuOpen = (open) => {
  navBar.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  menuToggle.setAttribute('aria-label', open ? 'Go to About Me' : 'Open navigation menu');
  headerActions.classList.toggle('menu-open', open);
  themeToggle.setAttribute('aria-hidden', open ? 'true' : 'false');
  themeToggle.tabIndex = open ? -1 : 0;
};

menuToggle.addEventListener('click', () => {
  if (navBar.classList.contains('open')) {
    setMenuOpen(false);
    window.location.hash = 'about';
  } else {
    setMenuOpen(true);
  }
});

document.querySelectorAll('.nav-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    if (navBar.classList.contains('open')) setMenuOpen(false);
  });
});

document.addEventListener('click', (event) => {
  if (navBar.classList.contains('open') && !navBar.contains(event.target)) {
    setMenuOpen(false);
  }
});

const formSuccess = document.getElementById('formSuccess');
const submitModal = document.getElementById('submitModal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const closeModal = document.getElementById('closeModal');

const params = new URLSearchParams(window.location.search);
if (params.get('sent') === '1') {
  formSuccess?.classList.add('show');
  showSubmitModal('success');
}
if (params.get('error') === '1') {
  showSubmitModal('error');
}

closeModal?.addEventListener('click', () => {
  submitModal.classList.remove('show');
  submitModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
});

submitModal?.addEventListener('click', (event) => {
  if (event.target === submitModal) {
    closeModal?.click();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && submitModal.classList.contains('show')) {
    closeModal?.click();
  }
});

const showSubmitModal = (type) => {
  const isSuccess = type === 'success';
  modalTitle.textContent = isSuccess ? 'Message sent' : 'Submission failed';
  modalText.textContent = isSuccess
    ? 'Your message has been received and I will get back to you soon.'
    : 'There was an issue sending your message. Please try again in a moment.';
  submitModal.classList.add('show');
  submitModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const modal = submitModal.querySelector('.modal');
  modal.classList.toggle('success', isSuccess);
  modal.classList.toggle('error', !isSuccess);
};

const CONTRIB_LEVEL_ALPHA = [0, 0.3, 0.5, 0.72, 1];

const contribTooltip = document.createElement('div');
contribTooltip.className = 'contrib-tooltip';
document.body.appendChild(contribTooltip);

const showContribTooltip = (cell, text) => {
  const rect = cell.getBoundingClientRect();
  contribTooltip.textContent = text;
  contribTooltip.style.left = `${rect.left + rect.width / 2}px`;
  contribTooltip.style.top = `${rect.top - 6}px`;
  contribTooltip.classList.add('show');
};
const hideContribTooltip = () => contribTooltip.classList.remove('show');

const formatContribDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const renderContribChart = async (container) => {
  const username = container.dataset.username;
  const rgb = container.dataset.rgb;
  const totalEl = container.querySelector('.contrib-chart-total');
  const monthsEl = container.querySelector('.contrib-months');
  const weeksEl = container.querySelector('.contrib-weeks');

  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
    if (!response.ok) throw new Error(`request failed: ${response.status}`);
    const data = await response.json();
    const days = data.contributions;

    const firstDate = new Date(`${days[0].date}T00:00:00`);
    const leadingBlanks = firstDate.getDay();
    const padded = Array(leadingBlanks).fill(null).concat(days);

    monthsEl.innerHTML = '';
    weeksEl.innerHTML = '';

    let lastMonth = -1;
    for (let i = 0; i < padded.length; i += 7) {
      const week = padded.slice(i, i + 7);
      const weekEl = document.createElement('div');
      weekEl.className = 'contrib-week';
      let monthLabel = '';

      week.forEach((day) => {
        const dayEl = document.createElement('div');
        dayEl.className = 'contrib-day';

        if (day) {
          const dayDate = new Date(`${day.date}T00:00:00`);
          if (dayDate.getDate() === 1 && dayDate.getMonth() !== lastMonth) {
            monthLabel = dayDate.toLocaleDateString(undefined, { month: 'short' });
            lastMonth = dayDate.getMonth();
          }
          if (day.level > 0) {
            dayEl.style.background = `rgba(${rgb}, ${CONTRIB_LEVEL_ALPHA[day.level]})`;
          }
          const text = `${day.count} contribution${day.count === 1 ? '' : 's'} on ${formatContribDate(day.date)}`;
          dayEl.tabIndex = 0;
          dayEl.setAttribute('role', 'img');
          dayEl.setAttribute('aria-label', text);
          dayEl.addEventListener('mouseenter', () => showContribTooltip(dayEl, text));
          dayEl.addEventListener('mouseleave', hideContribTooltip);
          dayEl.addEventListener('focus', () => showContribTooltip(dayEl, text));
          dayEl.addEventListener('blur', hideContribTooltip);
        } else {
          dayEl.style.visibility = 'hidden';
        }
        weekEl.appendChild(dayEl);
      });

      const monthEl = document.createElement('span');
      monthEl.className = 'contrib-month-label';
      monthEl.textContent = monthLabel;
      monthsEl.appendChild(monthEl);
      weeksEl.appendChild(weekEl);
    }

    if (totalEl) {
      const total = data.total.lastYear;
      totalEl.textContent = `${total} contribution${total === 1 ? '' : 's'} in the last year`;
    }
  } catch (err) {
    const scroll = container.querySelector('.contrib-scroll');
    if (scroll) {
      scroll.innerHTML = `<p class="contrib-error">Couldn't load GitHub activity for ${username}.</p>`;
    }
  }
};

document.querySelectorAll('.contrib-chart').forEach(renderContribChart);
