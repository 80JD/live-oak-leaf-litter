const button = document.querySelector('.menu-toggle');
const links = document.getElementById('navLinks');
function closeMenu() { links.classList.remove('active'); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Open navigation'); }
button.addEventListener('click', () => { const open = button.getAttribute('aria-expanded') !== 'true'; links.classList.toggle('active', open); button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { closeMenu(); button.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.main-nav')) closeMenu(); });
links.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
