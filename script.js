// Enhanced live preview logic for the mailbox decal builder.
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
  const hiddenTopX = document.getElementById('top-x-input');
  const hiddenTopY = document.getElementById('top-y-input');
  const hiddenBottomX = document.getElementById('bottom-x-input');
  const hiddenBottomY = document.getElementById('bottom-y-input');

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
    colorLabel: getSelectedColorLabel()
  };

  let guidesActive = false;
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
    if (fontPreview){
      const sample = previewTop.textContent.substring(0, 18) || 'AaBb 123';
      fontPreview.textContent = sample;
    }
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
  }

  if (previewTop){
    previewTop.addEventListener('pointerdown', event => startDrag(event, 'top'));
  }
  if (previewBottom){
    previewBottom.addEventListener('pointerdown', event => startDrag(event, 'bottom'));
  }

  if (topInput) topInput.addEventListener('input', updateText);
  if (bottomInput) bottomInput.addEventListener('input', updateText);
  if (topCaps) topCaps.addEventListener('change', updateText);
  if (bottomCaps) bottomCaps.addEventListener('change', updateText);
  if (fontSelect) fontSelect.addEventListener('change', updateFont);
  colorRadios.forEach(r => r.addEventListener('change', updateColor));
  if (guidesToggle){
    guidesToggle.addEventListener('click', toggleGuides);
  }

  if (form){
    form.addEventListener('submit', () => {
      const color = getSelectedColorRadio();
      if (color){
        colorLabelInput.value = color.dataset.label || color.value;
      }
      const selectedFont = fontSelect.selectedOptions[0];
      fontLabel.value = selectedFont?.dataset.label || simplifyFontName(selectedFont?.value || fontSelect.value);
      updatePositionInputs();
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
  }

  applyAll();
})();
