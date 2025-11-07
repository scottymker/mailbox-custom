# Quick Start Guide - Mailbox Customizer v2.0

## For End Users

### New Features You'll Love

#### 1. Adjust Text Size
Look for the new **"Top text size"** and **"Bottom text size"** sliders in the Style section. Drag to resize your text from 12px to 40px.

#### 2. Mirror Your Design
Click the **"Mirror mode"** button to flip your text horizontally - perfect for creating designs for both sides of your mailbox!

#### 3. Download Your Design
Click **"Export PNG"** to download your preview as a high-quality image you can share or save.

#### 4. Share Your Design
Press **Ctrl+S** (or Cmd+S on Mac) to copy a shareable link. Anyone with the link can see your exact design!

#### 5. Keyboard Shortcuts
- **Ctrl+Z**: Undo your last change
- **Ctrl+Shift+Z**: Redo
- **Arrow keys**: Nudge text position (hold Shift for bigger moves)
- **+/-**: Increase/decrease text size
- **G**: Toggle alignment guides
- **M**: Toggle mirror mode

### Mobile-Friendly
The entire site now works great on phones and tablets! All buttons are touch-friendly and the layout adapts to your screen.

---

## For Developers

### What's New in v2.0

**8 Major Features Added:**
1. Text size controls with real-time sliders
2. Mirror mode for opposite-side designs
3. PNG export with html2canvas
4. Full keyboard shortcut system
5. Undo/redo with 50-state history
6. Design URL sharing (base64 encoded)
7. Enhanced font preview (shows user text)
8. Mobile responsive design (768px/480px breakpoints)

### Installation

```bash
# No build step required - it's pure HTML/CSS/JS!
# Just open index.html in a browser or deploy to any static host

# Optional: Run a local server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Files Modified
- `index.html`: Added controls, buttons, html2canvas library
- `styles.css`: Added mobile queries, new class styles
- `script.js`: Added ~340 lines of new functionality

### All Existing Features Preserved
✅ Drag-and-drop text positioning
✅ 9 Google Fonts + 45+ color swatches
✅ All-caps toggles
✅ Character counters (32 max)
✅ Guide overlay
✅ Form submission flow
✅ Admin dashboard (untouched)

### Testing

```bash
# Open in browser and test:
1. Type text in both fields
2. Drag text around preview
3. Try all new buttons
4. Use keyboard shortcuts
5. Test on mobile viewport
6. Share a design URL
7. Export as PNG
```

### Quick Integration with Backend

```javascript
// Example: Send design to your API
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const design = {
    top: topInput.value,
    bottom: bottomInput.value,
    font: fontSelect.value,
    color: getSelectedColorValue(),
    // ... all other fields
  };

  const response = await fetch('/api/designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(design)
  });

  if (response.ok) {
    window.location.href = 'success.html';
  }
});
```

### Environment Variables for Backend

```env
# .env file (when you add backend)
SENDGRID_API_KEY=your_key_here
DATABASE_URL=postgresql://localhost/mailbox_db
ADMIN_PASSWORD=secure_password
```

---

## Keyboard Shortcuts Reference Card

Print this or keep it handy:

| Action | Shortcut |
|--------|----------|
| **Undo** | Ctrl+Z (⌘Z on Mac) |
| **Redo** | Ctrl+Shift+Z or Ctrl+Y |
| **Copy share link** | Ctrl+S (⌘S on Mac) |
| **Export PNG** | Ctrl+E (⌘E on Mac) |
| **Increase size** | + or = |
| **Decrease size** | - |
| **Move text up** | ↑ |
| **Move text down** | ↓ |
| **Move text left** | ← |
| **Move text right** | → |
| **Big nudge** | Shift + Arrows |
| **Toggle guides** | G |
| **Toggle mirror** | M |

---

## Deployment (Static)

### Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Build command:** (none)
**Publish directory:** `.`

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages

```bash
# Push to GitHub
git add .
git commit -m "Deploy mailbox customizer"
git push origin main

# Enable GitHub Pages in repo Settings > Pages
# Select source: main branch, / (root)
```

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari iOS 14+
- ✅ Mobile Chrome Android 10+

**Graceful degradation:**
- Export requires html2canvas (fallback to right-click save)
- Clipboard API requires HTTPS (fallback to prompt dialog)

---

## Troubleshooting

### Export button doesn't work
- Check if html2canvas loaded (look in Network tab)
- Try right-click > "Save Image As..." on preview
- Use browser screenshot tool as alternative

### Share link doesn't copy
- Must use HTTPS in production
- Fallback prompt will appear with URL
- Manually copy from prompt dialog

### Text doesn't drag on mobile
- Use one finger to drag
- Ensure touch-action: none is applied
- Try refreshing if it gets stuck

### Undo/redo not working
- History resets on page refresh (by design)
- Must have made changes first
- Check keyboard focus isn't in text input

---

## What's Next?

See **ENHANCEMENTS.md** for:
- Full feature documentation
- Backend integration guide
- Future enhancement ideas
- Security recommendations
- Testing checklist
- Performance optimization tips

---

## Support

**For users:** Contact Wall Decor Plus More
**For developers:** Check browser console for errors, review ENHANCEMENTS.md

**Last updated:** 2025-10-30
**Version:** 2.0
