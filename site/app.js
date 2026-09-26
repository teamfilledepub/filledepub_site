(() => {
  const root = document.documentElement;
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const motion = document.querySelector('.motion-toggle');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const copy = document.querySelector('#copy-email');
  root.classList.add('js-ready');
  menu.hidden = false;
  motion.hidden = false;
  copy.hidden = false;
  const setMenu = open => { menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); } });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) setMenu(false); });
  window.matchMedia('(max-width: 540px)').addEventListener('change', () => setMenu(false));
  let userPaused = false;
  const setMotion = () => {
    const paused = userPaused || reduceMotion.matches;
    root.classList.toggle('motion-paused', paused);
    motion.setAttribute('aria-pressed', String(paused));
    const label = reduceMotion.matches ? 'Animations désactivées selon vos préférences système' : paused ? 'Reprendre les animations' : 'Mettre les animations en pause';
    motion.setAttribute('aria-label', label); motion.title = label;
    motion.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
    motion.disabled = reduceMotion.matches;
  };
  motion.addEventListener('click', () => { userPaused = !userPaused; setMotion(); });
  reduceMotion.addEventListener('change', setMotion);
  setMotion();
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.08 });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('is-visible'));
  const details = document.querySelectorAll('.service-item');
  const scrollHighlight = window.matchMedia('(max-width: 800px), (hover: none), (pointer: coarse)');
  const header = document.querySelector('.site-header');
  const serviceSummaries = Array.from(details, item => ({ item, summary: item.querySelector('summary') }));
  let activeService = null;
  let serviceFrame = 0;
  const updateServiceHighlight = () => {
    serviceFrame = 0;
    let nextService = null;
    if (scrollHighlight.matches) {
      const visibleTop = Math.max(0, header.getBoundingClientRect().bottom);
      const visibleBottom = window.innerHeight;
      const readingLine = visibleTop + (visibleBottom - visibleTop) / 2;
      let nearestDistance = Infinity;
      serviceSummaries.forEach(({ item, summary }) => {
        const rect = summary.getBoundingClientRect();
        if (rect.bottom <= visibleTop || rect.top >= visibleBottom) return;
        const distance = Math.abs(rect.top + rect.height / 2 - readingLine);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nextService = item;
        }
      });
    }
    if (nextService === activeService) return;
    activeService?.classList.remove('is-scroll-active');
    nextService?.classList.add('is-scroll-active');
    activeService = nextService;
  };
  const scheduleServiceHighlight = () => {
    if (!serviceFrame) serviceFrame = requestAnimationFrame(updateServiceHighlight);
  };
  // Touch screens have no hover: follow the title nearest the reading line.
  window.addEventListener('scroll', scheduleServiceHighlight, { passive: true });
  window.addEventListener('resize', scheduleServiceHighlight);
  scrollHighlight.addEventListener('change', scheduleServiceHighlight);
  window.addEventListener('pageshow', scheduleServiceHighlight);
  scheduleServiceHighlight();
  details.forEach(item => item.addEventListener('toggle', () => {
    if (item.open) details.forEach(other => { if (other !== item && other.open) other.open = false; });
    scheduleServiceHighlight();
  }));
  let copyTimer;
  copy.addEventListener('click', async () => {
    const feedback = document.querySelector('#copy-feedback');
    clearTimeout(copyTimer);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText('allo@filledepub.com');
      copy.textContent = 'Adresse copiée !'; feedback.textContent = 'L’adresse allo@filledepub.com a été copiée.';
    } catch {
      copy.textContent = 'Sélectionnez l’adresse'; feedback.textContent = 'Copie indisponible. Sélectionnez allo@filledepub.com pour la copier.';
      const range = document.createRange(); range.selectNodeContents(document.querySelector('.email-link')); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    }
    copyTimer = setTimeout(() => { copy.textContent = 'Copier l’adresse'; }, 3500);
  });
  const quoteForm = document.querySelector('#quote-form');
  const quoteResult = document.querySelector('#quote-result');
  const quotePreview = document.querySelector('#quote-preview');
  const quoteFeedback = document.querySelector('#quote-feedback');
  quoteForm.addEventListener('input', event => {
    event.target.setCustomValidity?.('');
    quoteResult.hidden = true;
    quoteFeedback.textContent = '';
  });
  quoteForm.addEventListener('submit', event => {
    event.preventDefault();
    quoteForm.querySelectorAll('[required]').forEach(field => {
      field.setCustomValidity(field.value.trim() ? '' : 'Merci de renseigner ce champ.');
    });
    if (!quoteForm.reportValidity()) return;
    const fields = new FormData(quoteForm);
    const value = name => String(fields.get(name) || '').trim();
    const date = value('date');
    const formattedDate = date ? date.split('-').reverse().join('/') : 'À définir';
    const message = [
      'Bonjour Fille de Pub,', '',
      'Je souhaite échanger avec vous sur un projet d’animation commerciale.', '',
      `Nom : ${value('name')}`,
      `Entreprise : ${value('company') || 'Non précisée'}`,
      `E-mail : ${value('email')}`,
      `Lieu : ${value('location') || 'À définir'}`,
      `Date envisagée : ${formattedDate}`, '',
      'Mon projet :', value('project'), '',
      'Merci et à bientôt !', value('name')
    ].join('\n');
    quotePreview.value = message;
    document.querySelector('#quote-email').href = `mailto:allo@filledepub.com?subject=${encodeURIComponent('Demande d’animation commerciale — Fille de Pub')}&body=${encodeURIComponent(message)}`;
    quoteResult.hidden = false;
    quoteFeedback.textContent = 'Votre demande est prête à être envoyée depuis votre messagerie.';
    quoteResult.focus({ preventScroll: true });
    quoteResult.scrollIntoView({ block: 'nearest', behavior: userPaused || reduceMotion.matches ? 'auto' : 'smooth' });
  });
  document.querySelector('#copy-quote').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(quotePreview.value);
      quoteFeedback.textContent = 'Demande copiée. Collez-la dans un e-mail adressé à allo@filledepub.com.';
    } catch {
      quotePreview.focus();
      quotePreview.select();
      quoteFeedback.textContent = 'Le message est sélectionné. Copiez-le dans votre messagerie pour l’envoyer à allo@filledepub.com.';
    }
  });
  document.querySelector('#quote-builder').hidden = false;
})();
