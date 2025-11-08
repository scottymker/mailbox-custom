// Enhanced live preview logic for the mailbox decal builder with advanced features.
(function(){
  const form = document.getElementById('decal-form');
  const previewWrap = document.getElementById('preview-stage');
  const previewTop = document.getElementById('preview-top');
  const previewBottom = document.getElementById('preview-bottom');
  if (!form || !previewWrap || !previewTop || !previewBottom) return;

  const topInput = document.getElementById('top-input');
  const bottomInput = document.getElementById('bottom-input');
  const topCaps = document.getElementById('top-caps');
  const bottomCaps = document.getElementById('bottom-caps');
  const fontSelect = document.getElementById('font-select');
  const fontPreview = document.getElementById('font-preview');
  const fontLabel = document.getElementById('font-label');
  const colorRadios = Array.from(form.querySelectorAll('input[name="color"]'));
  const colorLabelInput = document.getElementById('color-label');
  const guidesToggle = document.getElementById('guides-toggle');
  const mirrorToggle = document.getElementById('mirror-toggle');
  const exportBtn = document.getElementById('export-btn');
  const topSizeSlider = document.getElementById('top-size-slider');
  const bottomSizeSlider = document.getElementById('bottom-size-slider');
  const topSizeValue = document.getElementById('top-size-value');
  const bottomSizeValue = document.getElementById('bottom-size-value');
  const hiddenTopX = document.getElementById('top-x-input');
  const hiddenTopY = document.getElementById('top-y-input');
  const hiddenBottomX = document.getElementById('bottom-x-input');
  const hiddenBottomY = document.getElementById('bottom-y-input');
  const hiddenTopSize = form.querySelector('input[name="topSize"]');
  const hiddenBottomSize = form.querySelector('input[name="bottomSize"]');

  const counters = {
    top: document.querySelector('[data-counter="top"]'),
    bottom: document.querySelector('[data-counter="bottom"]')
  };

  const defaultPositions = readInitialPositions();
  let positions = clonePositions(defaultPositions);

  const defaults = {
    top: topInput ? topInput.value : '',
    bottom: bottomInput ? bottomInput.value : '',
    topCaps: !!(topCaps && topCaps.checked),
    bottomCaps: !!(bottomCaps && bottomCaps.checked),
    font: fontSelect ? fontSelect.value : '',
    fontLabel: getSelectedFontLabel(),
    color: getSelectedColorValue(),
    colorLabel: getSelectedColorLabel(),
    topSize: 20,
    bottomSize: 20
  };

  let guidesActive = false;
  let mirrorActive = false;

  // NEW FEATURE: Undo/Redo History
  const MAX_HISTORY = 50;
  let history = [];
  let historyIndex = -1;
  const dragState = {
    active: false,
    key: null,
    pointerId: null,
    target: null
  };

  function sanitize(value, fallback){
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : fallback;
  }

  function toCaps(value, shouldCap){
    return shouldCap ? value.toUpperCase() : value;
  }

  function updateCounter(input, counterNode){
    if (!input || !counterNode) return;
    counterNode.textContent = `${input.value.length}/${input.maxLength}`;
  }

  function updateText(){
    const topValue = sanitize(topInput.value, previewTop.dataset.placeholder || defaults.top);
    const bottomValue = sanitize(bottomInput.value, previewBottom.dataset.placeholder || defaults.bottom);
    previewTop.textContent = toCaps(topValue, topCaps.checked);
    previewBottom.textContent = toCaps(bottomValue, bottomCaps.checked);
    updateCounter(topInput, counters.top);
    updateCounter(bottomInput, counters.bottom);
  }

  function updateFont(){
    const selected = fontSelect.selectedOptions[0];
    const stack = selected ? selected.value : fontSelect.value;
    previewTop.style.fontFamily = stack;
    previewBottom.style.fontFamily = stack;
    if (fontPreview) fontPreview.style.fontFamily = stack;
    const label = selected?.dataset.label || simplifyFontName(stack);
    fontLabel.value = label;
  }

  function updateColor(){
    const selected = getSelectedColorRadio();
    const color = selected ? selected.value : '#ffffff';
    previewTop.style.color = color;
    previewBottom.style.color = color;
    colorLabelInput.value = selected?.dataset.label || color;
    applyShadow(color);
  }

  function applyShadow(color){
    const glow = hexToRgba(color, .22);
    const baseShadow = '0 1px 1px rgba(0,0,0,.18)';
    previewTop.style.textShadow = `${baseShadow}, 0 0 18px ${glow}`;
    previewBottom.style.textShadow = `${baseShadow}, 0 0 18px ${glow}`;
  }

  function toggleGuides(){
    guidesActive = !guidesActive;
    previewWrap.classList.toggle('show-guides', guidesActive);
    if (guidesToggle){
      guidesToggle.setAttribute('aria-pressed', guidesActive ? 'true' : 'false');
      const label = guidesToggle.querySelector('span');
      if (label) label.textContent = guidesActive ? 'Hide guides' : 'Show guides';
    }
  }

  function getSelectedColorRadio(){
    return colorRadios.find(r => r.checked);
  }

  function getSelectedColorValue(){
    const selected = getSelectedColorRadio();
    return selected ? selected.value : '#ffffff';
  }

  function getSelectedColorLabel(){
    const selected = getSelectedColorRadio();
    return selected?.dataset.label || 'White';
  }

  function getSelectedFontLabel(){
    const selected = fontSelect?.selectedOptions?.[0];
    return selected?.dataset.label || (selected ? simplifyFontName(selected.value) : '');
  }

  function simplifyFontName(fontStack){
    if (!fontStack) return '';
    const map = {
      'Poppins':'Poppins',
      'Inter':'Inter',
      'Montserrat':'Montserrat',
      'Lora':'Lora',
      'Merriweather':'Merriweather',
      'Playfair Display':'Playfair Display',
      'Great Vibes':'Great Vibes',
      'Roboto Slab':'Roboto Slab',
      'Oswald':'Oswald'
    };
    const primary = fontStack.split(',')[0].trim().replace(/['"]/g,'');
    return map[primary] || primary;
  }

  function hexToRgba(hex, alpha){
    const value = hex.replace('#','');
    const isShort = value.length === 3;
    const bigint = parseInt(value, 16);
    const r = isShort ? parseInt(value[0]+value[0],16) : (bigint >> 16) & 255;
    const g = isShort ? parseInt(value[1]+value[1],16) : (bigint >> 8) & 255;
    const b = isShort ? parseInt(value[2]+value[2],16) : bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function setPosition(key, xPercent, yPercent){
    previewWrap.style.setProperty(`--${key}-x`, `${xPercent}%`);
    previewWrap.style.setProperty(`--${key}-y`, `${yPercent}%`);
  }

  function applyPositions(){
    setPosition('top', positions.top.x, positions.top.y);
    setPosition('bottom', positions.bottom.x, positions.bottom.y);
    updatePositionInputs();
  }

  function updatePositionInputs(){
    if (hiddenTopX) hiddenTopX.value = positions.top.x.toFixed(1);
    if (hiddenTopY) hiddenTopY.value = positions.top.y.toFixed(1);
    if (hiddenBottomX) hiddenBottomX.value = positions.bottom.x.toFixed(1);
    if (hiddenBottomY) hiddenBottomY.value = positions.bottom.y.toFixed(1);
  }

  function readInitialPositions(){
    const styles = getComputedStyle(previewWrap);
    return {
      top:{
        x: parsePercent(styles.getPropertyValue('--top-x'), 50),
        y: parsePercent(styles.getPropertyValue('--top-y'), 32)
      },
      bottom:{
        x: parsePercent(styles.getPropertyValue('--bottom-x'), 50),
        y: parsePercent(styles.getPropertyValue('--bottom-y'), 74)
      }
    };
  }

  function clonePositions(source){
    return {
      top:{ x: source.top.x, y: source.top.y },
      bottom:{ x: source.bottom.x, y: source.bottom.y }
    };
  }

  function parsePercent(value, fallback){
    const numeric = parseFloat(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function roundTo(value, precision){
    const power = Math.pow(10, precision);
    return Math.round(value * power) / power;
  }

  function clamp(value, min, max){
    return Math.min(Math.max(value, min), max);
  }

  function startDrag(event, key){
    if (event.pointerType !== 'touch' && event.button !== 0) return;
    event.preventDefault();
    dragState.active = true;
    dragState.key = key;
    dragState.pointerId = event.pointerId;
    dragState.target = event.currentTarget;
    if (dragState.target && dragState.target.setPointerCapture){
      dragState.target.setPointerCapture(event.pointerId);
    }
    dragState.target?.classList.add('is-dragging');
    updateFromPointer(event);
    window.addEventListener('pointermove', onDrag);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }

  function onDrag(event){
    if (!dragState.active || event.pointerId !== dragState.pointerId) return;
    updateFromPointer(event);
  }

  function endDrag(event){
    if (!dragState.active || event.pointerId !== dragState.pointerId) return;
    dragState.target?.classList.remove('is-dragging');
    if (dragState.target && dragState.target.releasePointerCapture && dragState.target.hasPointerCapture(dragState.pointerId)){
      dragState.target.releasePointerCapture(dragState.pointerId);
    }
    dragState.active = false;
    dragState.key = null;
    dragState.pointerId = null;
    dragState.target = null;
    window.removeEventListener('pointermove', onDrag);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  }

  function updateFromPointer(event){
    if (!dragState.key) return;
    const rect = previewWrap.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height);
    const percentX = roundTo((x / rect.width) * 100, 1);
    const percentY = roundTo((y / rect.height) * 100, 1);
    positions[dragState.key].x = percentX;
    positions[dragState.key].y = percentY;
    applyPositions();
    saveToHistory(); // Track position changes
  }

  // NEW FEATURE: Text Size Controls
  function updateTextSize(){
    const topSize = topSizeSlider ? topSizeSlider.value : 20;
    const bottomSize = bottomSizeSlider ? bottomSizeSlider.value : 20;
    previewWrap.style.setProperty('--top-size', `${topSize}px`);
    previewWrap.style.setProperty('--bottom-size', `${bottomSize}px`);
    if (topSizeValue) topSizeValue.textContent = `${topSize}px`;
    if (bottomSizeValue) bottomSizeValue.textContent = `${bottomSize}px`;
    if (hiddenTopSize) hiddenTopSize.value = topSize;
    if (hiddenBottomSize) hiddenBottomSize.value = bottomSize;
  }

  // NEW FEATURE: Mirror Mode Toggle
  function toggleMirror(){
    mirrorActive = !mirrorActive;
    previewTop.classList.toggle('mirrored', mirrorActive);
    previewBottom.classList.toggle('mirrored', mirrorActive);
    if (mirrorToggle){
      mirrorToggle.setAttribute('aria-pressed', mirrorActive ? 'true' : 'false');
      const label = mirrorToggle.querySelector('span');
      if (label) label.textContent = mirrorActive ? 'Normal mode' : 'Mirror mode';
    }
    saveToHistory();
  }

  // NEW FEATURE: Export Preview as PNG
  async function exportPreview(){
    try {
      // Use html2canvas library if available, otherwise use fallback
      if (typeof html2canvas !== 'undefined'){
        const canvas = await html2canvas(previewWrap, {
          backgroundColor: '#f6f7fb',
          scale: 2,
          logging: false
        });
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `mailbox-design-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
        });
      } else {
        // Fallback: Open share dialog
        alert('To export, please right-click on the preview and select "Save Image As..." or use the browser\'s screenshot tool.');
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try using your browser\'s screenshot tool instead.');
    }
  }

  // NEW FEATURE: URL Sharing - Encode current design state
  function getDesignURL(){
    const state = {
      top: topInput?.value || '',
      bottom: bottomInput?.value || '',
      topCaps: topCaps?.checked || false,
      bottomCaps: bottomCaps?.checked || false,
      font: fontSelect?.selectedOptions[0]?.dataset.label || 'Poppins',
      color: getSelectedColorValue(),
      topSize: topSizeSlider?.value || 20,
      bottomSize: bottomSizeSlider?.value || 20,
      topX: positions.top.x,
      topY: positions.top.y,
      bottomX: positions.bottom.x,
      bottomY: positions.bottom.y,
      mirror: mirrorActive
    };
    const encoded = btoa(JSON.stringify(state));
    const url = new URL(window.location.href);
    url.searchParams.set('design', encoded);
    return url.toString();
  }

  // NEW FEATURE: URL Sharing - Load design from URL
  function loadDesignFromURL(){
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('design');
    if (!encoded) return false;

    try {
      const state = JSON.parse(atob(encoded));
      if (topInput) topInput.value = state.top || '';
      if (bottomInput) bottomInput.value = state.bottom || '';
      if (topCaps) topCaps.checked = state.topCaps || false;
      if (bottomCaps) bottomCaps.checked = state.bottomCaps || false;
      if (topSizeSlider) topSizeSlider.value = state.topSize || 20;
      if (bottomSizeSlider) bottomSizeSlider.value = state.bottomSize || 20;

      // Set color
      const colorRadio = colorRadios.find(r => r.value === state.color);
      if (colorRadio) colorRadio.checked = true;

      // Set font
      const fontOption = Array.from(fontSelect.options).find(
        opt => opt.dataset.label === state.font
      );
      if (fontOption) fontSelect.value = fontOption.value;

      // Set positions
      positions.top.x = state.topX || positions.top.x;
      positions.top.y = state.topY || positions.top.y;
      positions.bottom.x = state.bottomX || positions.bottom.x;
      positions.bottom.y = state.bottomY || positions.bottom.y;

      // Set mirror
      mirrorActive = state.mirror || false;
      previewTop.classList.toggle('mirrored', mirrorActive);
      previewBottom.classList.toggle('mirrored', mirrorActive);

      applyAll();
      return true;
    } catch (err) {
      console.error('Failed to load design from URL:', err);
      return false;
    }
  }

  // NEW FEATURE: Copy share URL to clipboard
  function copyShareURL(){
    const url = getDesignURL();
    if (navigator.clipboard){
      navigator.clipboard.writeText(url).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(() => {
        prompt('Copy this URL to share your design:', url);
      });
    } else {
      prompt('Copy this URL to share your design:', url);
    }
  }

  // NEW FEATURE: Undo/Redo History Management
  function saveToHistory(){
    const state = {
      top: topInput?.value || '',
      bottom: bottomInput?.value || '',
      topCaps: topCaps?.checked || false,
      bottomCaps: bottomCaps?.checked || false,
      font: fontSelect?.value || '',
      color: getSelectedColorValue(),
      topSize: topSizeSlider?.value || 20,
      bottomSize: bottomSizeSlider?.value || 20,
      positions: clonePositions(positions),
      mirror: mirrorActive
    };

    // Remove any states after current index
    history = history.slice(0, historyIndex + 1);

    // Add new state
    history.push(state);

    // Keep history size manageable
    if (history.length > MAX_HISTORY){
      history.shift();
    } else {
      historyIndex++;
    }
  }

  function undo(){
    if (historyIndex <= 0) return;
    historyIndex--;
    restoreState(history[historyIndex]);
  }

  function redo(){
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    restoreState(history[historyIndex]);
  }

  function restoreState(state){
    if (!state) return;
    if (topInput) topInput.value = state.top;
    if (bottomInput) bottomInput.value = state.bottom;
    if (topCaps) topCaps.checked = state.topCaps;
    if (bottomCaps) bottomCaps.checked = state.bottomCaps;
    if (fontSelect) fontSelect.value = state.font;
    if (topSizeSlider) topSizeSlider.value = state.topSize;
    if (bottomSizeSlider) bottomSizeSlider.value = state.bottomSize;

    const colorRadio = colorRadios.find(r => r.value === state.color);
    if (colorRadio) colorRadio.checked = true;

    positions = clonePositions(state.positions);
    mirrorActive = state.mirror;
    previewTop.classList.toggle('mirrored', mirrorActive);
    previewBottom.classList.toggle('mirrored', mirrorActive);

    applyAll();
  }

  // NEW FEATURE: Keyboard Shortcuts
  function handleKeyboard(event){
    // Don't trigger shortcuts when typing in inputs
    if (event.target.matches('input, textarea, select')) return;

    const key = event.key.toLowerCase();
    const shift = event.shiftKey;
    const ctrl = event.ctrlKey || event.metaKey;

    // Undo/Redo
    if (ctrl && key === 'z' && !shift){
      event.preventDefault();
      undo();
      return;
    }
    if (ctrl && (key === 'y' || (key === 'z' && shift))){
      event.preventDefault();
      redo();
      return;
    }

    // Share URL
    if (ctrl && key === 's'){
      event.preventDefault();
      copyShareURL();
      return;
    }

    // Export
    if (ctrl && key === 'e'){
      event.preventDefault();
      exportPreview();
      return;
    }

    // Size adjustments (=+ to increase, - to decrease)
    if (key === '=' || key === '+'){
      event.preventDefault();
      if (topSizeSlider) topSizeSlider.value = Math.min(40, parseInt(topSizeSlider.value) + 1);
      if (bottomSizeSlider) bottomSizeSlider.value = Math.min(40, parseInt(bottomSizeSlider.value) + 1);
      updateTextSize();
      saveToHistory();
      return;
    }
    if (key === '-'){
      event.preventDefault();
      if (topSizeSlider) topSizeSlider.value = Math.max(12, parseInt(topSizeSlider.value) - 1);
      if (bottomSizeSlider) bottomSizeSlider.value = Math.max(12, parseInt(bottomSizeSlider.value) - 1);
      updateTextSize();
      saveToHistory();
      return;
    }

    // Arrow keys to nudge text (1% increments)
    const nudgeAmount = shift ? 5 : 1;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)){
      event.preventDefault();

      // Nudge top text by default, or bottom if focused
      const target = document.activeElement === previewBottom ? 'bottom' : 'top';

      switch(key){
        case 'arrowup':
          positions[target].y = clamp(positions[target].y - nudgeAmount, 10, 90);
          break;
        case 'arrowdown':
          positions[target].y = clamp(positions[target].y + nudgeAmount, 10, 90);
          break;
        case 'arrowleft':
          positions[target].x = clamp(positions[target].x - nudgeAmount, 5, 95);
          break;
        case 'arrowright':
          positions[target].x = clamp(positions[target].x + nudgeAmount, 5, 95);
          break;
      }
      applyPositions();
      saveToHistory();
      return;
    }

    // Toggle guides (G key)
    if (key === 'g'){
      event.preventDefault();
      toggleGuides();
      return;
    }

    // Toggle mirror (M key)
    if (key === 'm'){
      event.preventDefault();
      toggleMirror();
      return;
    }
  }

  if (previewTop){
    previewTop.addEventListener('pointerdown', event => startDrag(event, 'top'));
  }
  if (previewBottom){
    previewBottom.addEventListener('pointerdown', event => startDrag(event, 'bottom'));
  }

  if (topInput) topInput.addEventListener('input', () => { updateText(); saveToHistory(); });
  if (bottomInput) bottomInput.addEventListener('input', () => { updateText(); saveToHistory(); });
  if (topCaps) topCaps.addEventListener('change', () => { updateText(); saveToHistory(); });
  if (bottomCaps) bottomCaps.addEventListener('change', () => { updateText(); saveToHistory(); });
  if (fontSelect) fontSelect.addEventListener('change', () => { updateFont(); saveToHistory(); });
  colorRadios.forEach(r => r.addEventListener('change', () => { updateColor(); saveToHistory(); }));
  if (guidesToggle){
    guidesToggle.addEventListener('click', toggleGuides);
  }
  // NEW FEATURE: Event listeners for new controls
  if (mirrorToggle){
    mirrorToggle.addEventListener('click', toggleMirror);
  }
  if (exportBtn){
    exportBtn.addEventListener('click', exportPreview);
  }
  if (topSizeSlider){
    topSizeSlider.addEventListener('input', () => { updateTextSize(); saveToHistory(); });
  }
  if (bottomSizeSlider){
    bottomSizeSlider.addEventListener('input', () => { updateTextSize(); saveToHistory(); });
  }
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);

  // ============================================
  // BIGCOMMERCE CART INTEGRATION
  // ============================================
  // Configuration: Set these values in your BigCommerce store
  const BIGCOMMERCE_CONFIG = {
    storeHash: 'YOUR_STORE_HASH', // Find in your BigCommerce dashboard URL
    productId: YOUR_PRODUCT_ID,    // The mailbox decal product ID in your catalog
    apiPath: '/api/storefront/carts' // BigCommerce Storefront Cart API endpoint
  };

  async function addToCart(designData) {
    try {
      // Prepare cart line item with custom fields for the design
      const lineItem = {
        productId: BIGCOMMERCE_CONFIG.productId,
        quantity: 1,
        optionSelections: [
          {
            optionId: 'custom_text_top',
            optionValue: designData.topLine
          },
          {
            optionId: 'custom_text_bottom',
            optionValue: designData.bottomLine
          },
          {
            optionId: 'font',
            optionValue: designData.fontName
          },
          {
            optionId: 'color',
            optionValue: designData.colorName
          }
        ]
      };

      // Get or create cart
      let cartId = localStorage.getItem('bc_cart_id');
      let cartData;

      if (cartId) {
        // Add to existing cart
        const response = await fetch(`${BIGCOMMERCE_CONFIG.apiPath}/${cartId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ lineItems: [lineItem] })
        });
        cartData = await response.json();
      } else {
        // Create new cart
        const response = await fetch(BIGCOMMERCE_CONFIG.apiPath, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            lineItems: [lineItem],
            locale: 'en'
          })
        });
        cartData = await response.json();
        if (cartData.id) {
          localStorage.setItem('bc_cart_id', cartData.id);
        }
      }

      return { success: true, cart: cartData };
    } catch (error) {
      console.error('BigCommerce cart error:', error);
      return { success: false, error: error.message };
    }
  }

  if (form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent default form submission

      const color = getSelectedColorRadio();
      if (color){
        colorLabelInput.value = color.dataset.label || color.value;
      }
      const selectedFont = fontSelect.selectedOptions[0];
      const fontName = selectedFont?.dataset.label || simplifyFontName(selectedFont?.value || fontSelect.value);
      fontLabel.value = fontName;
      updatePositionInputs();

      // Prepare design data for BigCommerce
      const designData = {
        topLine: topInput.value || '',
        bottomLine: bottomInput.value || '',
        fontName: fontName,
        colorName: colorLabelInput.value,
        colorHex: color?.value || '#fdfbfb',
        topCaps: topCaps?.checked || false,
        bottomCaps: bottomCaps?.checked || false,
        topSize: topSizeSlider?.value || '20',
        bottomSize: bottomSizeSlider?.value || '20',
        topX: hiddenTopX?.value || '50',
        topY: hiddenTopY?.value || '32',
        bottomX: hiddenBottomX?.value || '50',
        bottomY: hiddenBottomY?.value || '74',
        notes: form.querySelector('#notes')?.value || ''
      };

      // Add to BigCommerce cart
      const submitBtn = document.getElementById('add-to-cart-btn');
      const originalText = submitBtn.querySelector('span').textContent;
      submitBtn.querySelector('span').textContent = 'Adding...';
      submitBtn.disabled = true;

      const result = await addToCart(designData);

      if (result.success) {
        // Redirect to success page with design params
        const params = new URLSearchParams({
          top: designData.topLine,
          bottom: designData.bottomLine,
          font: fontSelect.value,
          fontName: designData.fontName,
          color: designData.colorHex,
          colorName: designData.colorName,
          topCaps: designData.topCaps,
          bottomCaps: designData.bottomCaps,
          topSize: designData.topSize,
          bottomSize: designData.bottomSize,
          topX: designData.topX,
          topY: designData.topY,
          bottomX: designData.bottomX,
          bottomY: designData.bottomY,
          notes: designData.notes
        });
        window.location.href = `success.html?${params.toString()}`;
      } else {
        alert('Unable to add to cart. Please try again or contact support.');
        submitBtn.querySelector('span').textContent = originalText;
        submitBtn.disabled = false;
      }
    });

    form.addEventListener('reset', () => {
      window.requestAnimationFrame(() => {
        topInput.value = defaults.top;
        bottomInput.value = defaults.bottom;
        if (topCaps) topCaps.checked = defaults.topCaps;
        if (bottomCaps) bottomCaps.checked = defaults.bottomCaps;
        if (fontSelect) fontSelect.value = defaults.font;
        colorRadios.forEach(r => { r.checked = r.value === defaults.color; });
        positions = clonePositions(defaultPositions);
        guidesActive = false;
        previewWrap.classList.remove('show-guides');
        if (guidesToggle){
          guidesToggle.setAttribute('aria-pressed','false');
          const label = guidesToggle.querySelector('span');
          if (label) label.textContent = 'Show guides';
        }
        applyAll();
        window.scrollTo({top:0, behavior:'smooth'});
      });
    });
  }

  function applyAll(){
    applyPositions();
    updateText();
    updateFont();
    updateColor();
    updateTextSize(); // NEW FEATURE: Apply text size
  }

  // NEW FEATURE: Initialize - Load from URL if present, then apply all settings
  const loadedFromURL = loadDesignFromURL();
  if (!loadedFromURL){
    applyAll();
  }

  // NEW FEATURE: Save initial state to history
  saveToHistory();

  // NEW FEATURE: Add share button tooltip/helper
  const previewHeader = document.querySelector('.preview-header');
  if (previewHeader && !document.querySelector('.share-hint')){
    const shareHint = document.createElement('div');
    shareHint.className = 'preview-tags';
    shareHint.innerHTML = '<span class="tag">Press Ctrl+S to copy share link</span>';
    shareHint.style.marginBottom = '0.5rem';
    previewHeader.after(shareHint);
  }
})();
