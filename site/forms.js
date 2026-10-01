(() => {
  document.querySelectorAll('[data-contact-form]').forEach(form => {
    const feedback = form.querySelector('.form-feedback');
    const button = form.querySelector('[type=submit]');
    let pending = false, key = crypto.randomUUID();
    button.disabled = false;
    form.addEventListener('input', event => event.target.setCustomValidity?.(''));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (pending) return;
      form.querySelectorAll('[required]:not([type=checkbox])').forEach(field => field.setCustomValidity(field.value.trim() ? '' : 'Merci de renseigner ce champ.'));
      if (!form.reportValidity()) return;
      const fields = Object.fromEntries(new FormData(form));
      fields.type = form.dataset.contactForm;
      fields.consent = form.querySelector('[name=consent]').checked;
      fields.idempotencyKey = key;
      pending = true; button.disabled = true;
      feedback.className = 'form-feedback'; feedback.textContent = 'Envoi en cours…';
      try {
        const response = await fetch('/api/contacts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(fields), signal:AbortSignal.timeout(20000) });
        const data = await response.json().catch(() => ({error:'Le service est temporairement indisponible. Réessayez dans un instant.'}));
        if (!response.ok || data.error) throw new Error(data.error || 'L’envoi n’a pas abouti. Réessayez dans un instant.');
        feedback.classList.add('is-success');
        feedback.textContent = fields.type === 'candidature' ? 'Votre candidature est bien enregistrée. Merci ! Fille de Pub pourra vous contacter lorsqu’une mission correspond à votre profil.' : 'Votre demande est bien enregistrée. Merci ! L’équipe de Fille de Pub pourra revenir vers vous avec les coordonnées indiquées.';
        form.reset(); key = crypto.randomUUID(); feedback.focus({preventScroll:true});
      } catch(error) {
        feedback.classList.add('is-error');
        feedback.textContent = error.name === 'TimeoutError' ? 'La confirmation tarde à arriver. Réessayez : votre demande ne sera pas enregistrée deux fois.' : error instanceof TypeError ? 'Connexion indisponible. Vérifiez votre connexion et réessayez.' : error.message;
      } finally { pending = false; button.disabled = false; }
    });
  });
})();
