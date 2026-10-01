(() => {
  const $ = s => document.querySelector(s);
  let state, dirty = false, cursor = null, contactType = '', uploadPending = false, publishPending = false, contentVersion = 0;
  const feedback = (text, error = false) => { $('#admin-feedback').textContent = text; $('#admin-feedback').classList.toggle('error', error); };
  const node = (tag, text, className) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; };
  async function api(path, options = {}) {
    const r = await fetch(path, { ...options, headers: { ...(options.body && typeof options.body === 'string' ? { 'Content-Type':'application/json' } : {}), ...options.headers } });
    const data = await r.json().catch(() => ({error:'Le service est temporairement indisponible.'}));
    if (!r.ok || data.error) { if (r.status === 401) { $('#dashboard').hidden = true; $('#login-panel').hidden = false; } throw new Error(data.error || 'Une erreur est survenue.'); }
    return data;
  }
  const markDirty = () => { dirty = true; contentVersion++; $('#publish').disabled = publishPending; $('#dirty-state').textContent = 'Modifications en attente de publication.'; };
  function switchTab(id) {
    document.querySelectorAll('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== id);
    document.querySelectorAll('[data-tab]').forEach(b => b.dataset.tab === id ? b.setAttribute('aria-current','page') : b.removeAttribute('aria-current'));
    if (id === 'contacts') loadContacts();
  }
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.querySelectorAll('[data-open-tab]').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.openTab)));
  function renderTexts() {
    const container = $('#text-fields'); container.replaceChildren();
    const groups = [...new Set(state.fields.map(f => f.group))];
    $('#text-group').replaceChildren(new Option('Toutes les rubriques','all'), ...groups.map(g => new Option(g,g)));
    for (const group of groups) {
      const section = node('div', undefined, 'copy-group'); section.dataset.group = group;
      section.append(node('h3', group)); const fields = node('div', undefined, 'copy-fields');
      for (const f of state.fields.filter(f => f.group === group)) {
        const label = node('label', f.label); const input = document.createElement('textarea');
        input.value = state.config.texts[f.key]; input.maxLength = f.maxLength; input.rows = input.value.length > 180 ? 4 : 2;
        input.addEventListener('input', () => { state.config.texts[f.key] = input.value; markDirty(); });
        label.append(input); fields.append(label);
      }
      section.append(fields); container.append(section);
    }
  }
  $('#text-group').addEventListener('change', () => document.querySelectorAll('.copy-group').forEach(el => el.hidden = $('#text-group').value !== 'all' && el.dataset.group !== $('#text-group').value));
  function availableImages() {
    const originals = [
      {src:'/assets/activation-logo.svg',name:'Accueil — logo officiel',width:1536,height:1024},
      {src:'/assets/recrutement-960.webp',name:'Recrutement — animateur commercial',width:1536,height:1024},
      {src:'/assets/logo-fille-de-pub-noir.svg',name:'Logo Fille de Pub noir',width:2094,height:709},
      {src:'/assets/logo-fille-de-pub-blanc.svg',name:'Logo Fille de Pub blanc',width:2094,height:709},
      {src:'/assets/client-sos-pc-mobile.webp',name:'SOS PC Mobile',width:447,height:447},
      {src:'/assets/client-croque-moi.webp',name:'Croque & Moi',width:661,height:246},
      {src:'/assets/client-ekhaya.webp',name:'Ekhaya Home Deco',width:225,height:225}
    ];
    return originals.concat(state.media.map(m => ({...m,src:'/media/'+m.id,width:m.width||1200,height:m.height||800})));
  }
  function imageCard(item, title, remove, dark = false) {
    const card = node('article', undefined, 'image-card' + (dark ? ' dark' : '')); card.append(node('h4',title));
    const img = document.createElement('img'); img.src = item.src; img.alt = item.alt; card.append(img);
    const select = document.createElement('select');
    availableImages().forEach(m => select.add(new Option(m.name,m.src)));
    select.value = item.src;
    const selectLabel = node('label','Image'); selectLabel.append(select); card.append(selectLabel);
    const description = document.createElement('input'); description.value = item.alt; description.maxLength = 250;
    const descLabel = node('label','Description / nom'); descLabel.append(description); card.append(descLabel);
    select.addEventListener('change', () => {
      const selected = availableImages().find(m => m.src === select.value);
      Object.assign(item, {src:selected.src,width:selected.width,height:selected.height}); img.src = selected.src; markDirty();
      img.onload = () => { item.width = img.naturalWidth; item.height = img.naturalHeight; };
    });
    description.addEventListener('input', () => { item.alt = description.value; img.alt = description.value; markDirty(); });
    if (remove) { const button = node('button','Retirer de cet emplacement','remove'); button.type = 'button'; button.addEventListener('click', remove); card.append(button); }
    return card;
  }
  function renderImages() {
    const main = $('#main-images'); main.replaceChildren();
    for (const [key,title] of [['hero','Photo de l’accueil'],['recruitHero','Photo du recrutement'],['logoDark','Logo sur fond clair'],['logoLight','Logo sur fond sombre']]) main.append(imageCard(state.config.images[key],title,null,key==='logoLight'));
    for (const [key,selector] of [['clients','#client-images'],['gallery','#gallery-images']]) {
      const container = $(selector); container.replaceChildren();
      state.config[key].forEach((item,index) => container.append(imageCard(item,(key==='clients'?'Logo client ':'Photo ')+(index+1),()=>{state.config[key].splice(index,1);markDirty();renderImages();})));
    }
    const library = $('#media-library'); library.replaceChildren();
    if (!state.media.length) library.append(node('p','Aucune image importée pour le moment.'));
    for (const m of state.media) { const el = node('article',undefined,'media-tile');const img = document.createElement('img');img.src='/media/'+m.id;img.alt=m.name;el.append(img,node('p',m.name));library.append(el); }
  }
  const addImage = key => {
    if (!state.media.length) { feedback('Importez d’abord l’image à ajouter à cet emplacement.'); $('#media-upload').focus(); return; }
    if (state.config[key].length >= (key==='clients'?36:30)) { feedback('Le nombre maximal d’images est atteint.',true); return; }
    const m = state.media[0]; state.config[key].push({src:'/media/'+m.id,alt:m.name,width:m.width||1200,height:m.height||800});markDirty();renderImages();
  };
  $('#add-client').addEventListener('click',()=>addImage('clients'));
  $('#add-gallery').addEventListener('click',()=>addImage('gallery'));
  $('#media-upload').addEventListener('change',async event=>{
    const file=event.target.files[0]; if(!file||uploadPending)return;
    uploadPending=true;event.target.disabled=true;$('#upload-feedback').textContent='Optimisation et envoi de l’image…';
    try{
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw new Error('Choisissez un JPEG, PNG ou WebP de moins de 20 Mo.');
      const bitmap=await createImageBitmap(file);const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));
      const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
      let blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.9));
      if(blob?.size>1024*1024)blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.72));
      if(!blob||blob.size>1024*1024)throw new Error('Cette image reste trop volumineuse. Réduisez ses dimensions.');
      const result=await api('/api/admin/media?name='+encodeURIComponent(file.name),{method:'POST',body:blob,headers:{'Content-Type':blob.type}});
      state.media.unshift({...result,width:canvas.width,height:canvas.height});renderImages();
      $('#upload-feedback').textContent='Image ajoutée. Choisissez maintenant son emplacement, puis publiez les modifications.';
    }catch(error){$('#upload-feedback').textContent=error.message;}finally{uploadPending=false;event.target.disabled=false;event.target.value='';}
  });
  function renderTheme(){
    const email=$('#contact-email-setting');email.value=state.config.contactEmail;email.oninput=()=>{state.config.contactEmail=email.value;markDirty();};
    const colors={yellow:'Jaune principal',ink:'Texte et fond sombre',pink:'Rose',blue:'Bleu',muted:'Texte secondaire',white:'Fond clair'};
    const container=$('#color-fields');container.replaceChildren();
    for(const [key,title] of Object.entries(colors)){
      const label=node('label',title);const controls=node('div',undefined,'color-inputs');const picker=document.createElement('input');picker.type='color';picker.value=state.config.theme[key];picker.setAttribute('aria-label',title);
      const value=document.createElement('input');value.type='text';value.maxLength=7;value.value=picker.value;value.setAttribute('aria-label',title+' — code hexadécimal');
      picker.addEventListener('input',()=>{value.value=picker.value;state.config.theme[key]=picker.value;markDirty();});value.addEventListener('input',()=>{if(/^#[\da-f]{6}$/i.test(value.value)){picker.value=value.value;state.config.theme[key]=value.value;value.setCustomValidity('');markDirty();}else value.setCustomValidity('Format attendu : #RRGGBB');});
      controls.append(picker,value);label.append(controls);container.append(label);
    }
    const fonts={arial:'Arial · nette et classique',trebuchet:'Trebuchet · ronde et chaleureuse',verdana:'Verdana · lisible et ouverte',georgia:'Georgia · avec empattements',system:'Police système · adaptée à l’appareil'};
    for(const [selector,key] of [['#heading-font','headingFont'],['#body-font','bodyFont']]){
      const select=$(selector);select.replaceChildren(...Object.entries(fonts).map(([v,label])=>new Option(label,v)));select.value=state.config.theme[key];select.onchange=()=>{state.config.theme[key]=select.value;markDirty();};
    }
  }
  const labels={name:'Nom et prénom',email:'E-mail',phone:'Téléphone',company:'Entreprise',city:'Ville',profile:'Profil',availability:'Disponibilités',mobility:'Zones de déplacement',experience:'Présentation',location:'Lieu',date:'Date envisagée',project:'Projet',consentVersion:'Version du consentement'};
  function contactCard(contact){
    const card=node('details',undefined,'contact-card');const summary=document.createElement('summary');const title=node('div');title.append(node('strong',contact.data.name),node('small',new Date(contact.created_at).toLocaleString('fr-FR')+' · '+contact.data.email));summary.append(title,node('span',contact.kind==='candidature'?'Candidature':'Demande commerciale','badge'));card.append(summary);
    const data=node('dl',undefined,'contact-data');for(const [key,label] of Object.entries(labels)){if(!contact.data[key])continue;const pair=node('div',undefined,['project','experience','availability'].includes(key)?'wide':'');pair.append(node('dt',label),node('dd',contact.data[key]));data.append(pair);}card.append(data);
    const actions=node('div',undefined,'contact-actions');const label=node('label','Suivi');const status=document.createElement('select');['nouveau','contacté','archivé'].forEach(s=>status.add(new Option(s[0].toUpperCase()+s.slice(1),s)));status.value=contact.status;status.addEventListener('change',async()=>{try{await api('/api/admin/contacts/'+contact.id,{method:'PATCH',body:JSON.stringify({status:status.value})});feedback('Statut mis à jour.');}catch(error){feedback(error.message,true);}});label.append(status);const remove=node('button','Supprimer le contact','quiet');remove.addEventListener('click',()=>{$('#delete-dialog').showModal();$('#delete-dialog').addEventListener('close',async()=>{if($('#delete-dialog').returnValue!=='delete')return;try{await api('/api/admin/contacts/'+contact.id,{method:'DELETE'});card.remove();feedback('Contact supprimé de la base active.');}catch(error){feedback(error.message,true);}},{once:true});});actions.append(label,remove);card.append(actions);return card;
  }
  let contactsLoading=false;
  async function loadContacts(more=false){
    if(contactsLoading)return;contactsLoading=true;$('#more-contacts').disabled=true;
    try{if(!more){cursor=null;contactType=$('#contact-type').value;$('#contacts-list').replaceChildren();}
      $('#export-contacts').href='/api/admin/contacts/export?type='+encodeURIComponent(contactType);
      const data=await api('/api/admin/contacts?type='+encodeURIComponent(contactType)+(cursor?'&before='+cursor:''));
      if(!more&&!data.contacts.length)$('#contacts-list').append(node('p','Aucun contact pour le moment.','empty-state'));
      data.contacts.forEach(c=>$('#contacts-list').append(contactCard(c)));cursor=data.next;$('#more-contacts').hidden=!cursor;
    }catch(error){feedback(error.message,true);}finally{contactsLoading=false;$('#more-contacts').disabled=false;}
  }
  $('#contact-type').addEventListener('change',()=>loadContacts());$('#refresh-contacts').addEventListener('click',()=>loadContacts());$('#more-contacts').addEventListener('click',()=>loadContacts(true));
  function render(){renderTexts();renderImages();renderTheme();$('#total-leads').textContent=state.totals.find(t=>t.kind==='demande')?.count||0;$('#total-candidates').textContent=state.totals.find(t=>t.kind==='candidature')?.count||0;$('#site-revision').textContent=state.revision;$('#site-updated').textContent=state.updatedAt?'Mise à jour le '+new Date(state.updatedAt).toLocaleString('fr-FR'):'Version initiale';}
  async function open(){state=await api('/api/admin/state');$('#login-panel').hidden=true;$('#dashboard').hidden=false;render();}
  $('#login-form').addEventListener('submit',async event=>{event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;$('#login-feedback').textContent='Connexion…';try{await api('/api/admin/login',{method:'POST',body:JSON.stringify({password:event.target.elements.password.value})});event.target.reset();await open();$('#login-feedback').textContent='';}catch(error){$('#login-feedback').textContent=error.message;}finally{button.disabled=false;}});
  $('#logout').addEventListener('click',async()=>{try{await api('/api/admin/logout',{method:'POST'});dirty=false;location.reload();}catch(error){feedback(error.message,true);}});
  $('#publish').addEventListener('click',async()=>{
    if(publishPending||!dirty)return;const invalid=[...document.querySelectorAll('#color-fields input')].find(i=>!i.checkValidity());if(invalid){invalid.reportValidity();return;}
    publishPending=true;$('#publish').disabled=true;const version=contentVersion;
    try{const result=await api('/api/admin/site',{method:'PUT',body:JSON.stringify({revision:state.revision,config:state.config})});state.revision=result.revision;$('#site-revision').textContent=state.revision;state.updatedAt=Date.now();$('#site-updated').textContent='Mise à jour le '+new Date().toLocaleString('fr-FR');dirty=version!==contentVersion;$('#dirty-state').textContent=dirty?'De nouvelles modifications attendent encore leur publication.':'Toutes les modifications sont publiées.';feedback('Les modifications sont en ligne. Rechargez le site pour les voir.');}catch(error){feedback(error.message,true);}finally{publishPending=false;$('#publish').disabled=!dirty;}
  });
  window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
  open().catch(error=>{$('#login-feedback').textContent=error.message.includes('Connectez-vous')?'':error.message;});
})();
