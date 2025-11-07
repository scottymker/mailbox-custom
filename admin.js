// Admin dashboard logic for Mailbox Customizer.
(function(){
  const STORAGE_KEY = 'mailboxCustomizerAdmin';
  const timestampEl = document.getElementById('dashboard-timestamp');
  const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
  const sections = {
    orders: document.getElementById('orders-section'),
    settings: document.getElementById('settings-section'),
    designer: document.getElementById('designer-section'),
    guide: document.getElementById('guide-section')
  };
  const toastEl = document.getElementById('admin-toast');
  const ordersBody = document.getElementById('orders-body');
  const settingsForm = document.getElementById('settings-form');
  const settingsResetBtn = document.getElementById('settings-reset');
  const designListEl = document.getElementById('design-list');
  const designerEditor = document.getElementById('designer-editor');
  const designForm = document.getElementById('design-form');
  const addDesignBtn = document.getElementById('add-design');
  const duplicateDesignBtn = document.getElementById('design-duplicate');
  const deleteDesignBtn = document.getElementById('design-delete');
  const previewImg = document.getElementById('design-preview-img');
  const previewTop = document.getElementById('design-preview-top');
  const previewBottom = document.getElementById('design-preview-bottom');
  const topXSlider = document.getElementById('top-x');
  const topYSlider = document.getElementById('top-y');
  const bottomXSlider = document.getElementById('bottom-x');
  const bottomYSlider = document.getElementById('bottom-y');
  const topXOut = document.getElementById('top-x-output');
  const topYOut = document.getElementById('top-y-output');
  const bottomXOut = document.getElementById('bottom-x-output');
  const bottomYOut = document.getElementById('bottom-y-output');
  const designImageInput = document.getElementById('design-image');
  const designNameInput = document.getElementById('design-name');
  const designFontSelect = document.getElementById('design-font');
  const designTopTextInput = document.getElementById('design-top-text');
  const designBottomTextInput = document.getElementById('design-bottom-text');
  const designColorSelect = document.getElementById('design-color');

  const designFallback = {
    image:'mailbox_mockup_decal.png',
    font:"Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    topText:'1234 Sample Street',
    bottomText:'The Sample Family',
    color:'#fdfbfb',
    colorLabel:'White',
    topX:50,
    topY:32,
    bottomX:50,
    bottomY:68
  };

  const defaultState = {
    settings:{
      storeName:'Wall Decor Plus More',
      email:'orders@walldecorplusmore.com',
      phone:'(641) 555-0199',
      message:'Thanks for customizing your mailbox! Our team will reach out within one business day with a digital proof.'
    },
    orders:[
      {
        id:'ORD-1027',
        customer:'Heather Dobson',
        top:'712 Dobson Ave',
        bottom:'The Ymkers',
        color:'#008595',
        colorName:'Teal',
        placed:'2024-10-12',
        status:'new'
      },
      {
        id:'ORD-1026',
        customer:'Greg & Pam Wilson',
        top:'18 Cedar Ridge',
        bottom:'The Wilsons',
        color:'#826D43',
        colorName:'Metallic Gold',
        placed:'2024-10-11',
        status:'inprogress'
      },
      {
        id:'ORD-1025',
        customer:'City of Hartley',
        top:'Hartley Park',
        bottom:'Maintenance Office',
        color:'#FFCA17',
        colorName:'Yellow',
        placed:'2024-10-10',
        status:'complete'
      }
    ],
    designs:[
      {
        id:'classic-beige',
        name:'Classic Post • Warm Grey',
        ...designFallback,
        topText:'1234 Bourbon Drive',
        bottomText:'The Andersons',
        topX:47.5,
        topY:32,
        bottomX:52,
        bottomY:69
      },
      {
        id:'midnight-modern',
        name:'Midnight Modern • Teal',
        ...designFallback,
        image:'mailbox_mockup.png',
        font:"'Montserrat', Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        topText:'78 Oakwood Lane',
        bottomText:'Millers',
        color:'#008595',
        colorLabel:'Teal',
        topX:45,
        topY:30,
        bottomX:55,
        bottomY:66
      }
    ]
  };

  let state = loadState();
  let activeSection = 'orders';
  let activeDesignId = state.designs.length ? state.designs[0].id : null;
  let toastTimer = null;

  init();

  function init(){
    updateTimestamp();
    renderNav();
    renderOrders();
    bindSettings();
    renderSettings();
    renderDesignList();
    renderDesigner();

    navButtons.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const target = btn.dataset.section;
        if (!target || target === activeSection) return;
        switchSection(target);
      });
    });

    settingsForm.addEventListener('submit', onSettingsSubmit);
    settingsResetBtn.addEventListener('click', ()=>{
      renderSettings();
      showToast('Reverted to saved settings.');
    });

    addDesignBtn.addEventListener('click', addDesign);
    duplicateDesignBtn.addEventListener('click', duplicateDesign);
    deleteDesignBtn.addEventListener('click', deleteDesign);
    designForm.addEventListener('submit', onDesignSubmit);
    designImageInput.addEventListener('change', handleImageUpload);
    [topXSlider, topYSlider, bottomXSlider, bottomYSlider].forEach(slider=>{
      slider.addEventListener('input', onPositionInput);
    });
    designTopTextInput.addEventListener('input', handleTextChange);
    designBottomTextInput.addEventListener('input', handleTextChange);
    designFontSelect.addEventListener('change', ()=>{
      const design = getActiveDesign();
      if (!design) return;
      design.font = designFontSelect.value;
      saveState();
      updatePreview();
    });
    designColorSelect.addEventListener('change', ()=>{
      const design = getActiveDesign();
      if (!design) return;
      const option = designColorSelect.selectedOptions[0];
      design.color = option.value;
      design.colorLabel = option.dataset.label || option.textContent;
      saveState();
      updatePreview();
    });
  }

  function updateTimestamp(){
    if (!timestampEl) return;
    const now = new Date();
    const fmt = now.toLocaleString(undefined,{dateStyle:'medium', timeStyle:'short'});
    timestampEl.textContent = `Synced ${fmt}`;
  }

  function switchSection(section){
    if (!sections[section]) return;
    sections[activeSection].classList.add('hidden');
    navButtons.find(btn=>btn.dataset.section===activeSection)?.classList.remove('active');
    activeSection = section;
    navButtons.find(btn=>btn.dataset.section===activeSection)?.classList.add('active');
    sections[activeSection].classList.remove('hidden');
    if (section === 'orders') renderOrders();
    if (section === 'designer') renderDesigner();
  }

  function renderNav(){
    navButtons.forEach(btn=>{
      if (btn.dataset.section === activeSection){
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    Object.keys(sections).forEach(key=>{
      if (key === activeSection){
        sections[key].classList.remove('hidden');
      } else {
        sections[key].classList.add('hidden');
      }
    });
  }

  function renderOrders(){
    if (!ordersBody) return;
    if (!state.orders.length){
      ordersBody.innerHTML = `<tr><td colspan="7">No orders queued up. Share the builder link to start collecting submissions.</td></tr>`;
      return;
    }
    const rows = state.orders.map(order=>{
      const badgeClass = getStatusBadgeClass(order.status);
      return `<tr data-order-id="${order.id}">
        <td><strong>${order.id}</strong></td>
        <td>${order.customer}</td>
        <td>${order.top}</td>
        <td>${order.bottom}</td>
        <td>${renderColorSwatch(order)}</td>
        <td>${formatDate(order.placed)}</td>
        <td>
          <span class="status-badge ${badgeClass}">${formatStatus(order.status)}</span>
          <select aria-label="Update status for ${order.id}">
            ${renderStatusOptions(order.status)}
          </select>
        </td>
      </tr>`;
    }).join('');
    ordersBody.innerHTML = rows;
    ordersBody.querySelectorAll('select').forEach(select=>{
      select.addEventListener('change', handleStatusChange);
    });
  }

  function renderColorSwatch(order){
    const sw = `<span class="badge"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${order.color};border:1px solid rgba(0,0,0,.12);"></span>${order.colorName}</span>`;
    return sw;
  }

  function renderStatusOptions(current){
    const statuses = [
      {value:'new', label:'New'},
      {value:'inprogress', label:'In progress'},
      {value:'proof_sent', label:'Proof sent'},
      {value:'complete', label:'Completed'},
      {value:'cancelled', label:'Cancelled'}
    ];
    return statuses.map(s=>`<option value="${s.value}" ${s.value===current?'selected':''}>${s.label}</option>`).join('');
  }

  function handleStatusChange(event){
    const row = event.target.closest('tr');
    const id = row?.dataset.orderId;
    if (!id) return;
    const order = state.orders.find(o=>o.id===id);
    if (!order) return;
    order.status = event.target.value;
    saveState();
    renderOrders();
    showToast(`Order ${id} updated to ${formatStatus(order.status)}.`);
  }

  function bindSettings(){
    if (!settingsForm) return;
    settingsForm.storeName = document.getElementById('store-name');
    settingsForm.email = document.getElementById('store-email');
    settingsForm.phone = document.getElementById('store-phone');
    settingsForm.message = document.getElementById('store-message');
  }

  function renderSettings(){
    if (!settingsForm) return;
    const data = state.settings;
    settingsForm.storeName.value = data.storeName || '';
    settingsForm.email.value = data.email || '';
    settingsForm.phone.value = data.phone || '';
    settingsForm.message.value = data.message || '';
  }

  function onSettingsSubmit(event){
    event.preventDefault();
    const formData = new FormData(settingsForm);
    state.settings = {
      storeName: formData.get('storeName') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      message: formData.get('message') || ''
    };
    saveState();
    showToast('Settings saved.');
  }

  function renderDesignList(){
    if (!designListEl) return;
    if (!state.designs.length){
      designListEl.innerHTML = `<div class="empty-state"><i data-lucide="inbox"></i><p>No mailbox designs yet. Add your first template to keep the customer builder fresh.</p></div>`;
      if (window.lucide) window.lucide.createIcons();
      designerEditor.classList.add('hidden');
      return;
    }
    designerEditor.classList.remove('hidden');
    designListEl.innerHTML = state.designs.map(design=>{
      const active = design.id === activeDesignId ? 'active' : '';
      return `<button class="design-item ${active}" role="tab" data-design-id="${design.id}">
        <span>${design.name}</span>
        <small>${design.font.split(',')[0].replace(/['"]/g,'')}</small>
      </button>`;
    }).join('');
    designListEl.querySelectorAll('.design-item').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        activeDesignId = btn.dataset.designId;
        renderDesignList();
        renderDesigner();
        showToast('Template ready to edit.');
      });
    });
  }

  function renderDesigner(){
    const design = getActiveDesign();
    if (!design) {
      designerEditor.classList.add('hidden');
      return;
    }
    designerEditor.classList.remove('hidden');
    previewImg.src = design.image;
    designNameInput.value = design.name;
    designFontSelect.value = design.font;
    designTopTextInput.value = design.topText;
    designBottomTextInput.value = design.bottomText;
    designColorSelect.value = design.color;
    const activeOption = designColorSelect.selectedOptions[0];
    if (activeOption) {
      activeOption.selected = true;
    }
    setSliderValue(topXSlider, topXOut, design.topX);
    setSliderValue(topYSlider, topYOut, design.topY);
    setSliderValue(bottomXSlider, bottomXOut, design.bottomX);
    setSliderValue(bottomYSlider, bottomYOut, design.bottomY);
    updatePreview();
  }

  function onPositionInput(){
    const design = getActiveDesign();
    if (!design) return;
    design.topX = parseFloat(topXSlider.value);
    design.topY = parseFloat(topYSlider.value);
    design.bottomX = parseFloat(bottomXSlider.value);
    design.bottomY = parseFloat(bottomYSlider.value);
    setSliderValue(topXSlider, topXOut, design.topX);
    setSliderValue(topYSlider, topYOut, design.topY);
    setSliderValue(bottomXSlider, bottomXOut, design.bottomX);
    setSliderValue(bottomYSlider, bottomYOut, design.bottomY);
    updatePreview();
    saveState();
  }

  function handleTextChange(){
    const design = getActiveDesign();
    if (!design) return;
    design.topText = designTopTextInput.value;
    design.bottomText = designBottomTextInput.value;
    updatePreview();
    saveState();
  }

  function onDesignSubmit(event){
    event.preventDefault();
    const design = getActiveDesign();
    if (!design) return;
    design.name = designNameInput.value.trim() || design.name;
    const option = designColorSelect.selectedOptions[0];
    if (option){
      design.color = option.value;
      design.colorLabel = option.dataset.label || option.textContent;
    }
    saveState();
    renderDesignList();
    showToast('Design saved locally.');
  }

  function addDesign(){
    const id = `design-${Date.now()}`;
    const base = {
      id,
      name:'New Mailbox Template',
      image:'mailbox_mockup_decal.png',
      font:"Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      topText:'1234 Sample Street',
      bottomText:'The Sample Family',
      color:'#fdfbfb',
      colorLabel:'White',
      topX:50,
      topY:32,
      bottomX:50,
      bottomY:68
    };
    state.designs.unshift(base);
    activeDesignId = id;
    saveState();
    renderDesignList();
    renderDesigner();
    showToast('New design template created.');
  }

  function duplicateDesign(){
    const design = getActiveDesign();
    if (!design) return;
    const index = state.designs.findIndex(d=>d.id===design.id);
    const copy = {...design, id:`${design.id}-copy-${Date.now()}`, name:`${design.name} (Copy)`};
    state.designs.splice(index + 1,0,copy);
    activeDesignId = copy.id;
    saveState();
    renderDesignList();
    renderDesigner();
    showToast('Template duplicated.');
  }

  function deleteDesign(){
    if (!confirm('Delete this design template? This removes it from this browser until re-created or imported.')) return;
    const index = state.designs.findIndex(d=>d.id===activeDesignId);
    if (index === -1) return;
    state.designs.splice(index,1);
    activeDesignId = state.designs.length ? state.designs[0].id : null;
    saveState();
    renderDesignList();
    renderDesigner();
    showToast('Design removed.');
  }

  function handleImageUpload(event){
    const design = getActiveDesign();
    if (!design) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e=>{
      const dataUrl = e.target?.result;
      if (typeof dataUrl === 'string'){
        design.image = dataUrl;
        saveState();
        updatePreview();
        showToast('Background updated.');
      }
    };
    reader.readAsDataURL(file);
  }

  function updatePreview(){
    const design = getActiveDesign();
    if (!design) return;
    previewImg.src = design.image;
    previewTop.textContent = design.topText || 'Top line';
    previewBottom.textContent = design.bottomText || 'Bottom line';
    previewTop.style.left = `${design.topX}%`;
    previewTop.style.top = `${design.topY}%`;
    previewBottom.style.left = `${design.bottomX}%`;
    previewBottom.style.top = `${design.bottomY}%`;
    previewTop.style.fontFamily = design.font;
    previewBottom.style.fontFamily = design.font;
    previewTop.style.color = design.color;
    previewBottom.style.color = design.color;
    previewTop.style.textShadow = previewBottom.style.textShadow = `0 1px 1px rgba(0,0,0,.18), 0 0 18px ${hexToRgba(design.color, 0.24)}`;
  }

  function hexToRgba(hex, alpha){
    const value = hex.replace('#','');
    const isShort = value.length === 3;
    const bigint = parseInt(value,16);
    const r = isShort ? parseInt(value[0]+value[0],16) : (bigint >> 16) & 255;
    const g = isShort ? parseInt(value[1]+value[1],16) : (bigint >> 8) & 255;
    const b = isShort ? parseInt(value[2]+value[2],16) : bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function getStatusBadgeClass(status){
    switch(status){
      case 'inprogress': return 'status-inprogress';
      case 'proof_sent': return 'status-inprogress';
      case 'complete': return 'status-complete';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-new';
    }
  }

  function formatStatus(status){
    const map = {
      new:'New',
      inprogress:'In progress',
      proof_sent:'Proof sent',
      complete:'Completed',
      cancelled:'Cancelled'
    };
    return map[status] || status;
  }

  function formatDate(str){
    const date = new Date(str);
    if (!String(date)) return str;
    return date.toLocaleDateString(undefined,{month:'short', day:'numeric'});
  }

  function showToast(message){
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toastEl.classList.remove('show'), 2600);
  }

  function getActiveDesign(){
    return state.designs.find(d=>d.id===activeDesignId) || null;
  }

  function setSliderValue(slider, output, value){
    slider.value = value;
    output.textContent = Number(value).toFixed(1);
  }

  function saveState(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }catch(err){
      console.error('Unable to save admin state', err);
    }
  }

  function loadState(){
    try{
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored){
        const parsed = JSON.parse(stored);
        return mergeState(parsed);
      }
    }catch(err){
      console.warn('Failed to load admin state, using defaults', err);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  function mergeState(stored){
    const merged = JSON.parse(JSON.stringify(defaultState));
    if (stored){
      if (stored.settings) merged.settings = {...merged.settings, ...stored.settings};
      if (Array.isArray(stored.orders)) merged.orders = stored.orders;
      if (Array.isArray(stored.designs) && stored.designs.length){
        merged.designs = stored.designs.map(design=>({
          ...designFallback,
          ...design
        }));
      }
    }
    return merged;
  }
})();
