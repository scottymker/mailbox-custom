# BigCommerce Integration Setup Guide

This guide will help you integrate the Mailbox Customizer with your BigCommerce store.

## Prerequisites

- Active BigCommerce store
- Access to BigCommerce dashboard (admin panel)
- Basic understanding of product setup in BigCommerce

## Step 1: Create the Mailbox Decal Product

1. Log into your BigCommerce dashboard
2. Go to **Products** > **Add a Product**
3. Create a new product with these details:
   - **Product Name**: Custom Mailbox Decal
   - **Price**: Set your retail price
   - **Category**: Choose appropriate category
   - **Description**: Add product description

4. **Important**: Note the Product ID
   - After saving, look at the URL: `...products.php?product_id=123`
   - The number (123) is your Product ID - you'll need this!

## Step 2: Add Custom Product Options

The customizer sends design data as product options. You need to create these options in your BigCommerce product:

1. In your product edit page, scroll to **Product Options**
2. Add the following Text Field options:

   **Option 1:**
   - Display Name: `Top Line Text`
   - Type: `Text Field`
   - Required: Yes
   - Option ID: `custom_text_top` (internal reference)

   **Option 2:**
   - Display Name: `Bottom Line Text`
   - Type: `Text Field`
   - Required: Yes
   - Option ID: `custom_text_bottom`

   **Option 3:**
   - Display Name: `Font`
   - Type: `Text Field`
   - Required: Yes
   - Option ID: `font`

   **Option 4:**
   - Display Name: `Vinyl Color`
   - Type: `Text Field`
   - Required: Yes
   - Option ID: `color`

   **Option 5 (Optional):**
   - Display Name: `Design Notes`
   - Type: `Text Area`
   - Required: No
   - Option ID: `notes`

3. Save the product

## Step 3: Configure the Customizer

Open `/mailbox-custom/script.js` and update the BigCommerce configuration (around line 603):

```javascript
const BIGCOMMERCE_CONFIG = {
  storeHash: 'YOUR_STORE_HASH',  // Replace with your store hash
  productId: 123,                 // Replace with your Product ID from Step 1
  apiPath: '/api/storefront/carts'
};
```

### Finding Your Store Hash:
- Look at your BigCommerce dashboard URL
- Example: `https://store-abc123xyz.mybigcommerce.com/manage/...`
- Your store hash is: `abc123xyz`

## Step 4: Enable Storefront API

1. In BigCommerce dashboard, go to **Advanced Settings** > **API Accounts**
2. Click **Create API Account**
3. Choose **Storefront API Token**
4. Set permissions:
   - **Storefront API**: Read/Modify
   - **Carts**: Read/Modify
5. Save and note the API credentials

## Step 5: Deploy the Customizer

### Option A: Embed in BigCommerce (Recommended)

1. In BigCommerce, go to **Storefront** > **Script Manager**
2. Create a new script to load the customizer on a specific page
3. Or create a custom page template that includes the customizer

### Option B: Host Separately

1. Deploy the customizer to Netlify, Vercel, or GitHub Pages
2. Update CORS settings in BigCommerce:
   - Go to **Server Settings** > **CORS**
   - Add your customizer domain to allowed origins

## Step 6: Test the Integration

1. Open the customizer in a browser
2. Create a test design
3. Click "Add to Cart"
4. Verify:
   - Design is added to cart
   - All custom options are captured
   - Success page displays correctly
   - Cart page shows the custom fields

## Step 7: Update Success Page URLs

In `/mailbox-custom/success.html` (line 33-40), update the URLs to match your store:

```html
<!-- Continue Shopping button -->
<a href="https://www.walldecorplusmore.com" ...>

<!-- View Cart button -->
<a href="https://www.walldecorplusmore.com/cart.php" ...>
```

Replace with your actual BigCommerce store URLs.

## Troubleshooting

### "Unable to add to cart" Error

**Check:**
1. Product ID is correct in `script.js`
2. Product is active and visible in your store
3. All required product options are set up
4. CORS is configured if hosting separately
5. Browser console for specific error messages

### Custom Fields Not Showing in Cart

**Fix:**
1. Verify option IDs match exactly:
   - In BigCommerce product: `custom_text_top`
   - In script.js: `custom_text_top`
2. Ensure options are marked as "Required"
3. Check that option types are correct (Text Field, not other types)

### Cart ID Issues

The customizer stores the cart ID in localStorage. To reset:
```javascript
localStorage.removeItem('bc_cart_id');
```

## Advanced: Customizing the Integration

### Add More Design Options

To capture additional design parameters (like text size, position):

1. **In BigCommerce**: Add more Text Field options to the product
2. **In script.js**: Update the `lineItem.optionSelections` array:

```javascript
optionSelections: [
  // ... existing options
  {
    optionId: 'text_size',
    optionValue: designData.topSize + 'px / ' + designData.bottomSize + 'px'
  }
]
```

### Send Design Preview Image

You can also send the preview image as a base64 string:

1. Use the existing `exportPreviewAsDataURL()` function
2. Add as a product option or upload to BigCommerce via API

## Production Checklist

Before going live:

- [ ] Product created with correct price
- [ ] All product options configured
- [ ] Product ID updated in script.js
- [ ] Store hash updated in script.js
- [ ] API credentials configured
- [ ] CORS settings updated (if hosting separately)
- [ ] Success page URLs updated
- [ ] Tested complete purchase flow
- [ ] Verified order confirmation shows custom design details
- [ ] Logo added to hero section
- [ ] Color matte/glossy indicators added (if applicable)

## Support

For BigCommerce-specific questions:
- [BigCommerce Developer Docs](https://developer.bigcommerce.com/)
- [Storefront Cart API](https://developer.bigcommerce.com/api-reference/cart-checkout/storefront-cart-api)
- [Product Options Guide](https://support.bigcommerce.com/s/article/Product-Options-v3)

For customizer questions:
- Review inline code comments in `script.js`
- Check browser console for errors
- Contact Wall Decor Plus More support

---

**Last Updated**: 2025-11-07
**Version**: 2.1 (with BigCommerce integration)
