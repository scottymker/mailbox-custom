// Multi-design mailbox customizer - config-based
(function(){
  // Load design configuration from URL parameter
  const designId = getDesignFromURL();
  const designConfig = getDesign(designId);

  if (!designConfig) {
    console.error(`Design "${designId}" not found`);
    return;
  }

  // DOM elements
  const form = document.getElementById('decal-form');
  const previewTop = document.getElementById('preview-top');
  const previewBottom = document.getElementById('preview-bottom');
  const decalDesign = document.getElementById('decal-design');
  const mailboxBase = document.querySelector('.mailbox-base');
  const textOverlay = document.querySelector('.text-overlay');

  if (!form || !previewTop || !previewBottom) return;

  const topInput = document.getElementById('top-input');
  const bottomInput = document.getElementById('bottom-input');
  const fontSelect = document.getElementById('font-select');
  const fontLabel = document.getElementById('font-label');
  const colorLabelInput = document.getElementById('color-label');

  const counters = {
    top: document.querySelector('[data-counter="top"]'),
    bottom: document.querySelector('[data-counter="bottom"]')
  };

  // Initialize design
  initializeDesign();

  function initializeDesign() {
    // Set images
    if (mailboxBase) mailboxBase.src = designConfig.baseImage;
    if (decalDesign) {
      decalDesign.style.maskImage = `url(${designConfig.designImage})`;
      decalDesign.style.webkitMaskImage = `url(${designConfig.designImage})`;
    }

    // Apply text positioning from config
    if (textOverlay) {
      textOverlay.style.paddingTop = designConfig.textPosition.paddingTop;
      textOverlay.style.paddingLeft = designConfig.textPosition.paddingLeft;
      textOverlay.style.gap = designConfig.textPosition.gap;
      textOverlay.style.alignItems = designConfig.textPosition.align;
    }

    // Apply text sizing from config
    if (previewTop) {
      previewTop.style.fontSize = designConfig.textStyle.topSize;
      previewTop.style.maxWidth = designConfig.textStyle.maxWidth;
      previewTop.style.textAlign = designConfig.textStyle.textAlign;
    }
    if (previewBottom) {
      previewBottom.style.fontSize = designConfig.textStyle.bottomSize;
      previewBottom.style.maxWidth = designConfig.textStyle.maxWidth;
      previewBottom.style.textAlign = designConfig.textStyle.textAlign;
    }

    // Set default text values
    if (topInput) topInput.value = designConfig.defaults.top;
    if (bottomInput) bottomInput.value = designConfig.defaults.bottom;

    // Generate color swatches
    generateColorSwatches();

    // Generate font options
    generateFontOptions();
  }

  function generateColorSwatches() {
    const swatchesContainer = document.querySelector('.swatches');
    if (!swatchesContainer) return;

    swatchesContainer.innerHTML = '';

    designConfig.colors.forEach((color, index) => {
      const input = document.createElement('input');
      input.type = 'radio';
      input.id = `c-${color.label.toLowerCase().replace(/\s+/g, '-')}`;
      input.name = 'color';
      input.value = color.value;
      input.setAttribute('data-label', color.label);
      input.setAttribute('data-finish', color.finish);
      if (index === 0) input.checked = true;

      const label = document.createElement('label');
      label.className = `swatch ${color.finish}`;
      label.setAttribute('for', input.id);
      label.style.setProperty('--sw', color.value);
      label.title = `${color.label} (${color.finish.charAt(0).toUpperCase() + color.finish.slice(1)})`;

      swatchesContainer.appendChild(input);
      swatchesContainer.appendChild(label);

      input.addEventListener('change', updateColor);
    });
  }

  function generateFontOptions() {
    if (!fontSelect) return;

    fontSelect.innerHTML = '';

    designConfig.fonts.forEach((font, index) => {
      const option = document.createElement('option');
      option.value = font.value;
      option.setAttribute('data-label', font.label);
      option.textContent = font.label;
      if (index === 0) option.selected = true;

      fontSelect.appendChild(option);
    });
  }

  // Get current color selections
  function getSelectedColorRadio(){
    return Array.from(document.querySelectorAll('input[name="color"]')).find(r => r.checked);
  }

  function getSelectedColorValue(){
    const radio = getSelectedColorRadio();
    return radio ? radio.value : designConfig.defaults.color;
  }

  function getSelectedColorLabel(){
    const radio = getSelectedColorRadio();
    return radio ? (radio.dataset.label || radio.value) : 'White';
  }

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

  function simplifyFontName(fontStack){
    if (!fontStack) return designConfig.fonts[0].label;
    for (const font of designConfig.fonts) {
      if (fontStack.includes(font.label)) return font.label;
    }
    return designConfig.fonts[0].label;
  }

  function getSelectedFontLabel(){
    if (!fontSelect) return designConfig.fonts[0].label;
    const selected = fontSelect.selectedOptions[0];
    return selected?.dataset.label || simplifyFontName(selected?.value || fontSelect.value);
  }

  // Update functions
  function updateText(){
    const topValue = sanitize(topInput.value, previewTop.dataset.placeholder || designConfig.defaults.top);
    const bottomValue = sanitize(bottomInput.value, previewBottom.dataset.placeholder || designConfig.defaults.bottom);
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

    // Apply the exact same hex color to both text and design
    previewTop.style.color = colorValue;
    previewBottom.style.color = colorValue;

    // Apply the exact same hex color to the decal design (using CSS mask)
    if (decalDesign) {
      decalDesign.style.backgroundColor = colorValue;
    }

    if (colorLabelInput){
      colorLabelInput.value = color.dataset.label || colorValue;
    }
  }

  // Event listeners
  if (topInput) topInput.addEventListener('input', updateText);
  if (bottomInput) bottomInput.addEventListener('input', updateText);
  if (fontSelect) fontSelect.addEventListener('change', updateFont);

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

      // Prepare design data for BigCommerce
      const designData = {
        designId: designId,
        designName: designConfig.name,
        topLine: topInput.value || '',
        bottomLine: bottomInput.value || '',
        fontName: fontName,
        colorName: colorLabelInput.value,
        colorHex: color?.value || designConfig.defaults.color,
        notes: form.querySelector('#notes')?.value || ''
      };

      // For now, redirect to success page with params
      const params = new URLSearchParams({
        design: designId,
        top: designData.topLine,
        bottom: designData.bottomLine,
        font: fontSelect.value,
        fontName: designData.fontName,
        color: designData.colorHex,
        colorName: designData.colorName,
        notes: designData.notes
      });
      window.location.href = `success.html?${params.toString()}`;
    });

    form.addEventListener('reset', () => {
      window.requestAnimationFrame(() => {
        topInput.value = designConfig.defaults.top;
        bottomInput.value = designConfig.defaults.bottom;
        if (fontSelect) fontSelect.selectedIndex = 0;

        const colorRadios = Array.from(document.querySelectorAll('input[name="color"]'));
        colorRadios.forEach((r, i) => { r.checked = i === 0; });

        updateText();
        updateFont();
        updateColor();
      });
    });
  }

  // Initialize
  updateText();
  updateFont();
  updateColor();

})();
