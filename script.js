// Simplified mailbox customizer - no dragging, fixed positions
(function(){
  const form = document.getElementById('decal-form');
  const previewTop = document.getElementById('preview-top');
  const previewBottom = document.getElementById('preview-bottom');
  const decalDesign = document.getElementById('decal-design');

  if (!form || !previewTop || !previewBottom) return;

  const topInput = document.getElementById('top-input');
  const bottomInput = document.getElementById('bottom-input');
  const fontSelect = document.getElementById('font-select');
  const fontLabel = document.getElementById('font-label');
  const colorRadios = Array.from(form.querySelectorAll('input[name="color"]'));
  const colorLabelInput = document.getElementById('color-label');
  const mailboxColorRadios = Array.from(form.querySelectorAll('input[name="mailboxColor"]'));
  const mailboxColorLabel = document.getElementById('mailbox-color-label');

  const counters = {
    top: document.querySelector('[data-counter="top"]'),
    bottom: document.querySelector('[data-counter="bottom"]')
  };

  const defaults = {
    top: topInput ? topInput.value : '',
    bottom: bottomInput ? bottomInput.value : '',
    font: fontSelect ? fontSelect.value : '',
    color: getSelectedColorValue(),
    mailboxColor: getSelectedMailboxColor()
  };

  // Helper functions
  function sanitize(text, placeholder){
    const cleaned = (text || '').trim();
    return cleaned.length ? cleaned : placeholder;
  }

  function updateCounter(input, counterEl){
    if (!input || !counterEl) return;
    const len = input.value.length;
    const max = parseInt(input.getAttribute('maxlength')) || 32;
    counterEl.textContent = `${len}/${max}`;
  }

  function getSelectedColorRadio(){
    return colorRadios.find(r => r.checked);
  }

  function getSelectedColorValue(){
    const radio = getSelectedColorRadio();
    return radio ? radio.value : '#fdfbfb';
  }

  function getSelectedColorLabel(){
    const radio = getSelectedColorRadio();
    return radio ? (radio.dataset.label || radio.value) : 'White';
  }

  function getSelectedMailboxColorRadio(){
    return mailboxColorRadios.find(r => r.checked);
  }

  function getSelectedMailboxColor(){
    const radio = getSelectedMailboxColorRadio();
    return radio ? radio.value : '#C0C0C0';
  }

  function getSelectedMailboxColorLabel(){
    const radio = getSelectedMailboxColorRadio();
    return radio ? (radio.dataset.label || radio.value) : 'Silver';
  }

  function simplifyFontName(fontStack){
    if (!fontStack) return 'Poppins';
    const fontMap = {
      'Poppins': 'Poppins',
      'Inter': 'Inter',
      'Montserrat': 'Montserrat',
      'Lora': 'Lora',
      'Merriweather': 'Merriweather',
      'Playfair Display': 'Playfair Display',
      'Great Vibes': 'Great Vibes',
      'Roboto Slab': 'Roboto Slab',
      'Oswald': 'Oswald'
    };
    for (const key in fontMap){
      if (fontStack.includes(key)) return fontMap[key];
    }
    return 'Poppins';
  }

  function getSelectedFontLabel(){
    if (!fontSelect) return 'Poppins';
    const selected = fontSelect.selectedOptions[0];
    return selected?.dataset.label || simplifyFontName(selected?.value || fontSelect.value);
  }

  // Update functions
  function updateText(){
    const topValue = sanitize(topInput.value, previewTop.dataset.placeholder || defaults.top);
    const bottomValue = sanitize(bottomInput.value, previewBottom.dataset.placeholder || defaults.bottom);
    previewTop.textContent = topValue;
    previewBottom.textContent = bottomValue;
    updateCounter(topInput, counters.top);
    updateCounter(bottomInput, counters.bottom);
  }

  function updateFont(){
    const selected = fontSelect.selectedOptions[0];
    const fontFamily = fontSelect.value;
    previewTop.style.fontFamily = fontFamily;
    previewBottom.style.fontFamily = fontFamily;
    if (fontLabel){
      fontLabel.value = selected?.dataset.label || simplifyFontName(fontFamily);
    }
  }

  function updateColor(){
    const color = getSelectedColorRadio();
    if (!color) return;
    const colorValue = color.value;

    // Apply the same color to both text and design
    previewTop.style.color = colorValue;
    previewBottom.style.color = colorValue;

    // Apply the same color to the decal design layer
    if (decalDesign) {
      // Simple approach: use CSS filter to recolor the design
      // First convert black to white, then apply the color
      decalDesign.style.filter = `
        brightness(0)
        invert(1)
        sepia(1)
        saturate(5)
        hue-rotate(${getHueRotation(colorValue)}deg)
      `.replace(/\s+/g, ' ').trim();
    }

    if (colorLabelInput){
      colorLabelInput.value = color.dataset.label || colorValue;
    }
  }

  function getHueRotation(hex) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);

    // Convert RGB to HSL to get hue
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let hue = 0;
    if (delta !== 0) {
      if (max === rNorm) {
        hue = ((gNorm - bNorm) / delta) % 6;
      } else if (max === gNorm) {
        hue = (bNorm - rNorm) / delta + 2;
      } else {
        hue = (rNorm - gNorm) / delta + 4;
      }
      hue *= 60;
      if (hue < 0) hue += 360;
    }

    // Adjust for sepia base color (around 38 degrees)
    return hue - 38;
  }

  function updateMailboxColor(){
    const color = getSelectedMailboxColorRadio();
    if (!color || !decalDesign) return;
    const colorValue = color.value;

    // Apply color filter to the decal design layer to match text color
    // This changes the decorative line color to match the selected color
    const textColor = getSelectedColorValue();

    // For now, just store the selection
    if (mailboxColorLabel){
      mailboxColorLabel.value = color.dataset.label || colorValue;
    }
  }

  // Event listeners
  if (topInput) topInput.addEventListener('input', updateText);
  if (bottomInput) bottomInput.addEventListener('input', updateText);
  if (fontSelect) fontSelect.addEventListener('change', updateFont);
  colorRadios.forEach(r => r.addEventListener('change', updateColor));
  mailboxColorRadios.forEach(r => r.addEventListener('change', updateMailboxColor));

  // Form submission
  if (form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const color = getSelectedColorRadio();
      if (color){
        colorLabelInput.value = color.dataset.label || color.value;
      }
      const selectedFont = fontSelect.selectedOptions[0];
      const fontName = selectedFont?.dataset.label || simplifyFontName(selectedFont?.value || fontSelect.value);
      fontLabel.value = fontName;

      const mailboxColor = getSelectedMailboxColorRadio();
      if (mailboxColor && mailboxColorLabel){
        mailboxColorLabel.value = mailboxColor.dataset.label || mailboxColor.value;
      }

      // Prepare design data for BigCommerce
      const designData = {
        topLine: topInput.value || '',
        bottomLine: bottomInput.value || '',
        fontName: fontName,
        colorName: colorLabelInput.value,
        colorHex: color?.value || '#fdfbfb',
        mailboxColorName: mailboxColorLabel?.value || 'Silver',
        mailboxColorHex: mailboxColor?.value || '#C0C0C0',
        notes: form.querySelector('#notes')?.value || ''
      };

      // For now, redirect to success page with params
      const params = new URLSearchParams({
        top: designData.topLine,
        bottom: designData.bottomLine,
        font: fontSelect.value,
        fontName: designData.fontName,
        color: designData.colorHex,
        colorName: designData.colorName,
        mailboxColor: designData.mailboxColorHex,
        mailboxColorName: designData.mailboxColorName,
        notes: designData.notes
      });
      window.location.href = `success.html?${params.toString()}`;
    });

    form.addEventListener('reset', () => {
      window.requestAnimationFrame(() => {
        topInput.value = defaults.top;
        bottomInput.value = defaults.bottom;
        if (fontSelect) fontSelect.value = defaults.font;
        colorRadios.forEach(r => { r.checked = r.value === defaults.color; });
        mailboxColorRadios.forEach(r => { r.checked = r.value === defaults.mailboxColor; });
        updateText();
        updateFont();
        updateColor();
        updateMailboxColor();
      });
    });
  }

  // Initialize
  updateText();
  updateFont();
  updateColor();
  updateMailboxColor();

})();
