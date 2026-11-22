document.body.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
if (menuToggle && navigation) {
  menuToggle.hidden = false;
  const closeMenu = (restoreFocus = false) => {
    menuToggle.setAttribute('aria-expanded', 'false');
    navigation.dataset.open = 'false';
    if (restoreFocus) menuToggle.focus();
  };
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    navigation.dataset.open = String(open);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.dataset.open === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  matchMedia('(min-width: 881px)').addEventListener('change', () => closeMenu());
}

document.querySelectorAll('[data-year]').forEach(element => {
  element.textContent = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', year: 'numeric' }).format(new Date());
});

const form = document.querySelector('#enquiry-form');
if (form) {
  form.hidden = false;
  const arrival = form.elements.arrival;
  const departure = form.elements.departure;
  const preview = document.querySelector('#email-preview');
  const error = document.querySelector('#form-error');
  const emailLink = document.querySelector('#open-email');
  const bodyPreview = document.querySelector('#enquiry-body');
  const copyStatus = document.querySelector('#copy-status');
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  arrival.min = localDate;
  departure.min = localDate;
  let draft = '';

  const kind = new URLSearchParams(location.search).get('stay');
  if (['Backpackers', 'Garden cabin', 'Camping', 'Volunteering', 'Community visit'].includes(kind)) form.elements.interest.value = kind;

  const formatDate = value => value ? new Intl.DateTimeFormat('en-NZ', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z')) : 'Not yet decided';
  const invalidatePreview = () => { preview.hidden = true; error.textContent = ''; copyStatus.textContent = ''; };
  form.addEventListener('input', invalidatePreview);
  arrival.addEventListener('change', () => { departure.min = arrival.value || localDate; });

  form.addEventListener('submit', event => {
    event.preventDefault();
    error.textContent = '';
    if (Boolean(arrival.value) !== Boolean(departure.value)) {
      error.textContent = 'Please add both arrival and departure dates, or leave both empty if your plans are flexible.';
      (arrival.value ? departure : arrival).focus();
      return;
    }
    if (arrival.value && departure.value <= arrival.value) {
      error.textContent = 'Your departure date needs to be after your arrival date.';
      departure.focus();
      return;
    }
    const data = new FormData(form);
    const subject = `Rainbow Valley enquiry: ${data.get('interest')}`;
    const body = [
      'Hello Rainbow Valley,', '',
      `I’m interested in: ${data.get('interest')}`,
      `Name: ${data.get('name').trim()}`,
      `Reply email: ${data.get('email').trim()}`,
      `Arrival: ${formatDate(data.get('arrival'))}`,
      `Departure: ${formatDate(data.get('departure'))}`,
      `Guests: ${data.get('guests')}`, '',
      data.get('message').trim() || 'Please let me know about availability and current rates.', '',
      'Thank you!'
    ].join('\n');
    draft = `To: info@rainbowcommunity.org.nz\nSubject: ${subject}\n\n${body}`;
    bodyPreview.textContent = body;
    emailLink.href = `mailto:info@rainbowcommunity.org.nz?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    preview.hidden = false;
    preview.focus({ preventScroll: true });
    preview.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  });

  document.querySelector('#copy-enquiry').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draft);
      copyStatus.textContent = 'Enquiry copied. Paste it into an email to info@rainbowcommunity.org.nz.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(bodyPreview);
      selection.removeAllRanges();
      selection.addRange(range);
      copyStatus.textContent = 'Select and copy the highlighted enquiry, then email it to info@rainbowcommunity.org.nz.';
    }
  });
}
