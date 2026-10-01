(() => {
  const text = document.querySelector('#typewriter-text');
  const source = document.querySelector('#typewriter-accessible');
  if (!text || !source) return;
  const full = source.textContent.trim();
  const phrases = full.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(p => p.trim()) || [full];
  let phrase = 0, character = 0, timer;
  const paused = () => document.documentElement.classList.contains('motion-paused');
  const tick = () => {
    if (paused() || document.hidden) return;
    text.textContent = phrases[phrase].slice(0, ++character);
    if (character < phrases[phrase].length) timer = setTimeout(tick, 65);
    else timer = setTimeout(() => { phrase = (phrase + 1) % phrases.length; character = 0; text.textContent = ''; tick(); }, 1800);
  };
  const sync = () => {
    clearTimeout(timer);
    if (paused()) { text.textContent = full; return; }
    if (document.hidden) return;
    character = 0; text.textContent = ''; tick();
  };
  document.addEventListener('motionchange', sync);
  document.addEventListener('visibilitychange', sync);
  sync();
})();
