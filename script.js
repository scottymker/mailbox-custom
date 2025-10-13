// Minimal JS to wire up the preview and form behavior
(function(){
  const topSel = document.getElementById('preset-top');
  const botSel = document.getElementById('preset-bottom');
  const topText = document.getElementById('top-text');
  const bottomText = document.getElementById('bottom-text');
  const colorRadios = Array.from(document.querySelectorAll('input[name="color"]'));
  const resetBtn = document.getElementById('reset-btn');

  function updateText(){
    topText.textContent = topSel.value;
    bottomText.textContent = botSel.value;
  }
  function updateColor(){
    const checked = colorRadios.find(r=>r.checked);
    const color = checked ? checked.value : '#ffffff';
    topText.style.color = color;
    bottomText.style.color = color;
    // gentle glow that matches color
    topText.style.textShadow = `0 1px 1px rgba(0,0,0,.18), 0 0 16px ${hexToRgba(color, .22)}`;
    bottomText.style.textShadow = `0 1px 1px rgba(0,0,0,.18), 0 0 14px ${hexToRgba(color, .22)}`;
  }
  function hexToRgba(hex, a){
    const v = hex.replace('#','');
    const bigint = parseInt(v,16);
    const r = (v.length===3) ? parseInt(v[0]+v[0],16) : (bigint >> 16) & 255;
    const g = (v.length===3) ? parseInt(v[1]+v[1],16) : (bigint >> 8) & 255;
    const b = (v.length===3) ? parseInt(v[2]+v[2],16) : bigint & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  topSel.addEventListener('change', updateText);
  botSel.addEventListener('change', updateText);
  colorRadios.forEach(r=>r.addEventListener('change', updateColor));

  resetBtn.addEventListener('click', ()=>{
    topSel.selectedIndex = 0;
    botSel.selectedIndex = 0;
    const white = document.getElementById('c-white');
    if (white) white.checked = true;
    updateText(); updateColor();
    window.scrollTo({top:0, behavior:'smooth'});
  });

  // initialize
  updateText(); updateColor();
})();