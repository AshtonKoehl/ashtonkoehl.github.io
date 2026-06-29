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

// Preview button removed — use actual form submission to test flows

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
