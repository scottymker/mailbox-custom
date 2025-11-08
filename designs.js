/**
 * Mailbox Design Configurations
 *
 * Each design object contains:
 * - name: Display name of the design
 * - baseImage: Background mailbox image
 * - designImage: Decorative overlay (trees, mountains, etc.)
 * - textPosition: CSS positioning values for text overlay
 * - textStyle: Font sizes and constraints
 * - colors: Available color options for this design
 * - fonts: Available font options
 */

const DESIGNS = {
  'mailbox21': {
    name: 'Pine Trees & Hills',
    baseImage: 'mailbox_mockup.png',
    designImage: 'mailbox21_decal_edit.png',

    // Text positioning (CSS percentages)
    textPosition: {
      paddingTop: '30%',      // Vertical position from top
      paddingLeft: '40%',     // Horizontal position from left
      gap: '2rem',            // Space between top and bottom lines
      align: 'flex-start'     // left alignment
    },

    // Text styling
    textStyle: {
      topSize: '20px',        // Top line font size
      bottomSize: '18px',     // Bottom line font size
      maxWidth: '55%',        // Prevent text overflow
      textAlign: 'left'       // Text alignment
    },

    // Available colors (glossy outdoor vinyl)
    colors: [
      { value: '#fdfbfb', label: 'White', finish: 'glossy' },
      { value: '#181820', label: 'Black', finish: 'glossy' },
      { value: '#D2C3A3', label: 'Beige', finish: 'glossy' },
      { value: '#4E3629', label: 'Chocolate Brown', finish: 'glossy' },
      { value: '#353F63', label: 'Deep Blue', finish: 'glossy' },
      { value: '#D13F78', label: 'Hot Pink', finish: 'glossy' },
      { value: '#48A6D4', label: 'Ice Blue', finish: 'glossy' },
      { value: '#BF94BE', label: 'Lilac', finish: 'glossy' },
      { value: '#6FAB44', label: 'Lime Green', finish: 'glossy' },
      { value: '#808284', label: 'Metallic Silver', finish: 'glossy' },
      { value: '#F36122', label: 'Orange', finish: 'glossy' },
      { value: '#6A4474', label: 'Plum', finish: 'glossy' },
      { value: '#A5222D', label: 'Red', finish: 'glossy' },
      { value: '#F68CB8', label: 'Soft Pink', finish: 'glossy' },
      { value: '#798284', label: 'Storm Grey', finish: 'glossy' },
      { value: '#B08D67', label: 'Tan', finish: 'glossy' },
      { value: '#006BB5', label: 'Traffic Blue', finish: 'glossy' },
      { value: '#009FA0', label: 'Turquoise', finish: 'glossy' },
      { value: '#FFCA17', label: 'Yellow', finish: 'glossy' }
    ],

    // Available fonts
    fonts: [
      { value: 'Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', label: 'Poppins' },
      { value: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', label: 'Inter' },
      { value: "'Montserrat', Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", label: 'Montserrat' },
      { value: "'Lora', Georgia, 'Times New Roman', Times, serif", label: 'Lora' },
      { value: "'Merriweather', Georgia, 'Times New Roman', Times, serif", label: 'Merriweather' },
      { value: "'Playfair Display', Georgia, 'Times New Roman', Times, serif", label: 'Playfair Display' },
      { value: "'Great Vibes', 'Brush Script MT', cursive", label: 'Great Vibes' },
      { value: "'Roboto Slab', 'Times New Roman', Times, serif", label: 'Roboto Slab' },
      { value: "'Oswald', 'Arial Narrow', Inter, sans-serif", label: 'Oswald' }
    ],

    // Default text values
    defaults: {
      top: '1234 Bourbon Drive',
      bottom: 'The Andersons',
      font: 'Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      color: '#fdfbfb'
    }
  }

  // Add more designs here:
  // 'mailbox15': { ... },
  // 'mailbox08': { ... }
};

/**
 * Get design configuration by ID
 * @param {string} designId - Design identifier (e.g., 'mailbox21')
 * @returns {object|null} Design configuration or null if not found
 */
function getDesign(designId) {
  return DESIGNS[designId] || null;
}

/**
 * Get design ID from URL parameter
 * @returns {string} Design ID from ?design=mailbox21 or default 'mailbox21'
 */
function getDesignFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('design') || 'mailbox21';
}

/**
 * Get list of all available designs
 * @returns {array} Array of design IDs
 */
function getAllDesigns() {
  return Object.keys(DESIGNS);
}
