# Adding New Mailbox Designs

This guide explains how to add new mailbox designs to the customizer in 5-10 minutes.

## Overview

The customizer uses a config-based system where each design is defined in `designs.js`. The same HTML, CSS, and JavaScript code works for all designs - only the configuration changes.

## Quick Start: Adding a New Design

### Step 1: Prepare Your Design Assets

You need two images:

1. **Base mailbox image** - The background (mailbox photo)
   - Example: `mailbox_mockup.png`
   - Recommended: 1024x1024px

2. **Decorative overlay** - The design element (trees, mountains, etc.)
   - Example: `mailbox21_decal_edit.png`
   - **Must be 1024x1024px** (same size as base image)
   - **Must be black on transparent background**
   - This will be recolored dynamically via CSS

### Step 2: Measure Text Positioning

Open your design in an image editor (Photoshop, GIMP, etc.) and note where the text should appear:

1. **Horizontal position**: Measure from left edge as a percentage
   - Example: Text starts at 40% from left

2. **Vertical position**: Measure from top edge as a percentage
   - Example: Text starts at 30% from top

3. **Text alignment**: Left, center, or right?

4. **Max text width**: What % of the mailbox width can text occupy?
   - Example: 55% max-width to stay within mailbox bounds

### Step 3: Add Configuration to designs.js

Open `designs.js` and add a new entry to the `DESIGNS` object:

```javascript
const DESIGNS = {
  'mailbox21': {
    // ... existing design ...
  },

  // Add your new design here:
  'mailbox15': {  // ← Design ID (use in URL: ?design=mailbox15)
    name: 'Mountain Sunset',  // Display name

    // Your image files:
    baseImage: 'mailbox15_base.png',
    designImage: 'mailbox15_decal.png',

    // Text positioning (from your measurements):
    textPosition: {
      paddingTop: '35%',      // Vertical position
      paddingLeft: '45%',     // Horizontal position
      gap: '1.5rem',          // Space between top/bottom lines
      align: 'flex-start'     // left, flex-start, or center
    },

    // Text styling:
    textStyle: {
      topSize: '22px',        // Top line font size
      bottomSize: '18px',     // Bottom line font size
      maxWidth: '50%',        // Maximum text width
      textAlign: 'left'       // left, center, or right
    },

    // Available colors (copy from mailbox21 or customize):
    colors: [
      { value: '#fdfbfb', label: 'White', finish: 'glossy' },
      { value: '#181820', label: 'Black', finish: 'glossy' },
      // ... add more colors ...
    ],

    // Available fonts (copy from mailbox21 or customize):
    fonts: [
      { value: 'Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', label: 'Poppins' },
      // ... add more fonts ...
    ],

    // Default text values:
    defaults: {
      top: '5678 Mountain View',
      bottom: 'The Smiths',
      font: 'Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      color: '#fdfbfb'
    }
  }
};
```

### Step 4: Test Your Design

1. Add your image files to the repo
2. Open: `https://scottymker.github.io/mailbox-custom/?design=mailbox15`
3. Verify:
   - Text appears in the correct position
   - Colors work properly
   - Fonts display correctly
   - Text doesn't overflow the mailbox

### Step 5: Fine-Tune Positioning

If the text isn't quite right, adjust the config values:

- **Text too high?** Increase `paddingTop` (e.g., `30%` → `35%`)
- **Text too low?** Decrease `paddingTop`
- **Text too far left?** Increase `paddingLeft`
- **Text too far right?** Decrease `paddingLeft`
- **Lines too close?** Increase `gap` (e.g., `1.5rem` → `2rem`)
- **Text too big?** Reduce `topSize` and `bottomSize`
- **Text overflowing?** Reduce `maxWidth` or font size

## Configuration Reference

### Design ID
```javascript
'mailbox21': {  // This is the design ID
```
- Used in URL: `?design=mailbox21`
- Must be unique
- Use lowercase, numbers, hyphens only
- Recommendation: match your product SKU

### Text Position Values

```javascript
textPosition: {
  paddingTop: '30%',     // 0-100% (vertical position)
  paddingLeft: '40%',    // 0-100% (horizontal position)
  gap: '2rem',           // CSS size (1rem, 20px, etc.)
  align: 'flex-start'    // flex-start (left), center, flex-end (right)
}
```

### Text Style Values

```javascript
textStyle: {
  topSize: '20px',       // CSS size (16px, 1.5rem, etc.)
  bottomSize: '18px',    // CSS size
  maxWidth: '55%',       // 0-100% (prevents overflow)
  textAlign: 'left'      // left, center, right
}
```

### Color Format

```javascript
colors: [
  {
    value: '#fdfbfb',    // Hex color code
    label: 'White',      // Display name
    finish: 'glossy'     // 'glossy' or 'matte'
  }
]
```

### Font Format

```javascript
fonts: [
  {
    value: 'Poppins, Inter, system-ui, sans-serif',  // CSS font stack
    label: 'Poppins'                                  // Display name
  }
]
```

## Tips & Best Practices

### Image Preparation
- **Always use 1024x1024px** for both base and overlay images
- Overlay must be black on transparent background
- Save overlays as PNG with transparency
- Test on light and dark backgrounds

### Text Positioning
- Start with mailbox21 config and adjust from there
- Test with long addresses (32 characters)
- Ensure text doesn't overlap design elements
- Check on both mobile and desktop

### Colors
- Use the same 19 glossy colors across all designs for consistency
- Or customize per design if certain colors don't work well

### Fonts
- Limit to 6-9 fonts to avoid overwhelming customers
- Include mix of serif, sans-serif, and script options
- Test each font with long text to ensure readability

## BigCommerce Integration

When setting up products in BigCommerce:

1. Create product with options for text, font, color
2. Add "Customize" button with link:
   ```
   https://scottymker.github.io/mailbox-custom/?design=mailbox15&product=123
   ```
3. The `design` parameter loads your config
4. The `product` parameter (optional) tracks which BigCommerce product

## Common Issues

### Text not showing
- Check z-index in CSS (should be 10+)
- Verify text color contrasts with background
- Check browser console for JavaScript errors

### Design not recoloring
- Ensure overlay image is pure black (#000000)
- Check image has transparent background
- Verify CSS mask is applied correctly

### Text overflowing
- Reduce `maxWidth` percentage
- Decrease font sizes
- Adjust `paddingLeft` to start text earlier

### Wrong positioning
- Double-check percentage measurements
- Remember: 0% = top/left, 100% = bottom/right
- Test with different screen sizes

## Example: Complete New Design

```javascript
'mailbox08': {
  name: 'Lake & Pine Trees',
  baseImage: 'mailbox08_base.png',
  designImage: 'mailbox08_trees.png',

  textPosition: {
    paddingTop: '28%',
    paddingLeft: '38%',
    gap: '1.8rem',
    align: 'flex-start'
  },

  textStyle: {
    topSize: '21px',
    bottomSize: '19px',
    maxWidth: '58%',
    textAlign: 'left'
  },

  colors: [
    { value: '#fdfbfb', label: 'White', finish: 'glossy' },
    { value: '#181820', label: 'Black', finish: 'glossy' },
    { value: '#006BB5', label: 'Lake Blue', finish: 'glossy' }
  ],

  fonts: [
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Lora, serif', label: 'Lora' }
  ],

  defaults: {
    top: '9876 Lakeview Drive',
    bottom: 'The Johnsons',
    font: 'Poppins, sans-serif',
    color: '#fdfbfb'
  }
}
```

## Need Help?

Check the `mailbox21` config in `designs.js` as a complete working example.
