# BigCommerce Integration Guide

This guide explains how to integrate the mailbox customizer with your BigCommerce store at walldecorplusmore.com.

## Integration Overview

**Customer Flow:**
1. Browse walldecorplusmore.com → find mailbox product
2. Click "Customize" button → opens customizer in new tab
3. Design mailbox with live preview
4. Click "Add to Cart" → adds to BigCommerce cart with customization data
5. Checkout normally on BigCommerce

## Phase 1: Product Setup (Do This First)

### Step 1: Create Product Options

For each mailbox product in BigCommerce, add these **Text** or **Pick List** options:

1. **Top Line** (Text Field)
   - Type: Text
   - Max Length: 32
   - Required: Yes

2. **Bottom Line** (Text Field)
   - Type: Text
   - Max Length: 32
   - Required: Yes

3. **Font** (Pick List / Dropdown)
   - Type: Pick List
   - Options: Poppins, Inter, Montserrat, Lora, Merriweather, Playfair Display, Great Vibes, Roboto Slab, Oswald
   - Required: Yes

4. **Decal Color** (Pick List / Dropdown)
   - Type: Pick List
   - Options: White, Black, Beige, Chocolate Brown, Deep Blue, Hot Pink, Ice Blue, Lilac, Lime Green, Metallic Silver, Orange, Plum, Red, Soft Pink, Storm Grey, Tan, Traffic Blue, Turquoise, Yellow
   - Required: Yes

5. **Notes** (Text Area) - Optional
   - Type: Multi-line Text
   - Max Length: 120
   - Required: No

### Step 2: Add "Customize" Button to Product Page

In your BigCommerce theme, edit the product page template to add a "Customize" button:

```html
<a href="https://scottymker.github.io/mailbox-custom/?design={{sku}}&product={{product.id}}"
   target="_blank"
   class="button button--primary">
  Customize Your Mailbox
</a>
```

Replace:
- `{{sku}}` with the product SKU (e.g., `mailbox21`)
- `{{product.id}}` with BigCommerce product ID

**Note:** The exact template syntax depends on your BigCommerce theme (Stencil, Blueprint, etc.)

## Phase 2: API Integration (For Direct Cart Add)

### Prerequisites

You'll need:
- BigCommerce Storefront API credentials
- Product IDs for each mailbox
- Option IDs for Top Line, Bottom Line, Font, Color, Notes

### Step 1: Get API Credentials

1. Log in to BigCommerce admin
2. Go to **Advanced Settings** → **API Accounts**
3. Create a **Storefront API Token**
4. Note your **Store Hash** (from URL: `store-xxxxx.mybigcommerce.com`)

### Step 2: Configure script.js

Update `script.js` with your BigCommerce details:

```javascript
// BigCommerce Configuration
const BIGCOMMERCE_CONFIG = {
  storeHash: 'xxxxx',  // Your store hash
  storefrontToken: 'your-token-here',
  apiUrl: 'https://walldecorplusmore.com/api/storefront'
};

// Product ID mapping (design ID → BigCommerce product ID)
const PRODUCT_MAPPING = {
  'mailbox21': 123,  // Replace with actual product ID
  'mailbox15': 124,
  'mailbox08': 125
};
```

### Step 3: Update Form Submission Handler

Replace the current form submission in `script.js` with BigCommerce cart API call:

```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const productId = PRODUCT_MAPPING[designId];
  if (!productId) {
    alert('Product configuration error. Please contact support.');
    return;
  }

  // Prepare cart line item
  const lineItem = {
    productId: productId,
    quantity: 1,
    optionSelections: [
      { optionId: 1, optionValue: topInput.value },      // Top Line
      { optionId: 2, optionValue: bottomInput.value },   // Bottom Line
      { optionId: 3, optionValue: getSelectedFontLabel() },  // Font
      { optionId: 4, optionValue: getSelectedColorLabel() }, // Color
      { optionId: 5, optionValue: form.querySelector('#notes')?.value || '' } // Notes
    ]
  };

  try {
    // Get or create cart
    let cartId = localStorage.getItem('bc_cart_id');

    if (!cartId) {
      // Create new cart
      const createResponse = await fetch(
        `${BIGCOMMERCE_CONFIG.apiUrl}/carts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BIGCOMMERCE_CONFIG.storefrontToken}`
          },
          body: JSON.stringify({
            lineItems: [lineItem]
          })
        }
      );

      const cart = await createResponse.json();
      cartId = cart.data.id;
      localStorage.setItem('bc_cart_id', cartId);
    } else {
      // Add to existing cart
      await fetch(
        `${BIGCOMMERCE_CONFIG.apiUrl}/carts/${cartId}/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BIGCOMMERCE_CONFIG.storefrontToken}`
          },
          body: JSON.stringify({
            lineItems: [lineItem]
          })
        }
      );
    }

    // Success - redirect to cart
    window.location.href = 'https://walldecorplusmore.com/cart.php';

  } catch (error) {
    console.error('Cart error:', error);
    alert('Failed to add to cart. Please try again.');
  }
});
```

### Step 4: Get Option IDs

Option IDs are specific to each product. To find them:

1. Use BigCommerce API to get product details:
   ```bash
   curl https://api.bigcommerce.com/stores/xxxxx/v3/catalog/products/123 \
     -H "X-Auth-Token: your-api-token"
   ```

2. Look for `option_id` in the response
3. Update the `optionId` values in the code above

## Phase 3: Testing

### Test Checklist

- [ ] Click "Customize" on BigCommerce product page → opens customizer
- [ ] Customizer loads correct design based on `?design=` parameter
- [ ] Customize mailbox (text, font, color)
- [ ] Click "Add to Cart"
- [ ] Verify item appears in BigCommerce cart
- [ ] Check that all customization values are correct
- [ ] Complete checkout → verify order includes custom details

### Common Issues

**Issue:** "Add to Cart" fails with CORS error
- **Fix:** Enable CORS for your customizer domain in BigCommerce settings

**Issue:** Wrong product added to cart
- **Fix:** Check `PRODUCT_MAPPING` in script.js matches your product IDs

**Issue:** Customization values not showing in cart
- **Fix:** Verify option IDs match your BigCommerce product options

## Alternative: Simple URL Redirect (No API Required)

If you don't want to set up API integration yet, use this simpler approach:

### In script.js, use this submission handler:

```javascript
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Redirect back to BigCommerce product page with customization data
  const params = new URLSearchParams({
    action: 'add',
    product_id: PRODUCT_MAPPING[designId],
    qty: 1,
    option_1: topInput.value,           // Top Line
    option_2: bottomInput.value,        // Bottom Line
    option_3: getSelectedFontLabel(),   // Font
    option_4: getSelectedColorLabel(),  // Color
    option_5: form.querySelector('#notes')?.value || ''  // Notes
  });

  window.location.href = `https://walldecorplusmore.com/cart.php?${params.toString()}`;
});
```

This method:
- ✅ No API setup required
- ✅ Works immediately
- ❌ Customer must manually confirm on product page
- ❌ Slight UX friction

## Security Considerations

### DO:
- Use Storefront API tokens (not Management API tokens)
- Validate all user input before sending to BigCommerce
- Use HTTPS for all requests
- Store cart ID in localStorage (not cookies for security)

### DON'T:
- Expose Management API tokens in client-side code
- Trust user input without validation
- Store customer data in customizer
- Skip HTTPS

## Production Checklist

Before launching to customers:

- [ ] All product options configured in BigCommerce
- [ ] "Customize" buttons added to all mailbox products
- [ ] API credentials configured (if using direct cart add)
- [ ] Product ID mapping verified for all designs
- [ ] Option IDs verified for all products
- [ ] Tested full flow: browse → customize → add to cart → checkout
- [ ] Error handling tested (invalid design, API failures, etc.)
- [ ] Mobile experience tested
- [ ] Confirmed customization details appear in orders

## Support & Troubleshooting

### Enable Debug Logging

Add this to script.js for detailed logging:

```javascript
const DEBUG = true;

function log(...args) {
  if (DEBUG) console.log('[Customizer]', ...args);
}

// Use in code:
log('Adding to cart:', lineItem);
log('Cart response:', response);
```

### BigCommerce API Documentation

- [Storefront Cart API](https://developer.bigcommerce.com/api-reference/cart-checkout/storefront-cart-api)
- [Product Options](https://developer.bigcommerce.com/api-reference/catalog/catalog-api/products/getproducts)
- [CORS Settings](https://support.bigcommerce.com/s/article/Storefront-CORS)

## Next Steps

1. **Start with URL redirect method** (simplest, works immediately)
2. **Test with 1-2 products** to verify the flow
3. **Upgrade to API integration** for better UX
4. **Add all designs** once flow is proven

Need help? Check the [Adding New Designs](ADDING_NEW_DESIGNS.md) guide.
