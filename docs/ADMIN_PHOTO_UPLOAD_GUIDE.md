# Admin Photo Upload & Product Management Guide

## Overview
The FitStyle AI admin dashboard now supports complete photo upload functionality for garments. When admins add new products with photos, they automatically appear in user recommendations filtered by occasion.

## How to Add a Garment with Photo

### Step 1: Access Admin Dashboard
1. Go to app home page
2. Click **"Store Owners"** or **"Admin"** button
3. Sign in with owner credentials or use the test owner account
4. You'll see the **Boutique Catalogue** dashboard

### Step 2: Click "Add Garment" Button
- Located in top-right corner of the dashboard
- Opens a slide-out form panel

### Step 3: Fill in Garment Details
- **Garment Name**: e.g., "Emerald Silk Evening Gown"
- **Category**: Top, Bottom, Footwear, or Accessories
- **Occasion Target**: Wedding, Casual, Formal, Party, or Interview
- **Standard Fit Size**: S, M, L, XL, or One Size
- **Premium Colour Swatch**: e.g., "Emerald Green"
- **Retail Price**: Enter price in USD
- **Initial Stock Status**: Check box if available

### Step 4: Upload Garment Photo
**Option A: Upload from Computer**
1. Click **"📷 Upload Photo"** button
2. Select an image file (PNG, JPEG, or WebP)
3. Click "Open"
4. Photo uploads to Firebase Storage
5. Wait for success message: "✓ Photo uploaded successfully"
6. Photo preview appears below

**Option B: Use Preset Templates**
1. Click one of the preset buttons:
   - Gown Style
   - Pleat Skirt
   - Satin Blazer
   - Loafers Shoes
2. Instantly loads a professional stock photo

### Step 5: Save Product
1. Review all details
2. Click **"Save to Catalog"** button
3. Product is saved to Firestore with the uploaded photo
4. Toast notification confirms: "✓ Product added to catalog"

## How Users See Your Products

### In Trending Recommendations
1. Users go to **"Trending Combinations"** section
2. Products are automatically grouped by **Occasion**
3. Filter buttons show: All, Wedding, Formal, Casual, Party, Interview
4. Your new products appear in the filtered list with their uploaded photo

### Example Flows
**Wedding Dress Upload:**
1. Admin uploads "Ivory Lace Mermaid Gown" with Wedding occasion
2. Photo is stored in Firebase Storage
3. Users filter to Wedding occasion
4. Gown appears in their trending feed with the real photo

**Casual Outfit Upload:**
1. Admin uploads "Cream Silk Blouse" with Casual occasion
2. Photo URL stored in database
3. Users filter to Casual occasion
4. Blouse appears with uploaded photo

### In Virtual Fitting Studio
1. Users enter fitting studio and select an occasion
2. System filters products by that occasion
3. Products with your uploaded photos appear in recommendations
4. Users can try on combinations with your products

### In PDF Export
1. When users create an order with your products
2. The uploaded photo appears in the certified PDF summary
3. Professional layout includes product image and price

## Photo Upload Technical Details

### Storage Location
- Photos upload to Firebase Storage at: `products/{productId}/{filename}`
- URLs are generated and stored in Firestore as `imageUrl` field

### Supported Formats
- PNG
- JPEG
- WebP

### Image Requirements
- Recommended size: 600x800px or taller
- Format: Portrait orientation for best display
- Aspect ratio: 3:4 is ideal (like a mannequin photo)

### File Size Limits
- Maximum: 5MB per image
- Typical: Keep under 2MB for fast loading

## Editing Products

### To Update an Existing Product
1. Find the product in the Catalogue listing
2. Click **"Edit"** (pencil icon)
3. Update any details including photo
4. Click **"Update Garment"**
5. Changes sync to user views instantly

### To Remove a Product
1. Find product in the listing
2. Click **"Delete"** (trash icon)
3. Confirm deletion
4. Product disappears from all user views

## Troubleshooting

### "Photo upload failed"
- Check Firebase Storage permissions are enabled
- Ensure file size is under 5MB
- Try a different image format (JPEG instead of PNG)

### Photo doesn't appear for users
- Wait a few seconds for sync
- Refresh the user browser
- Check product was saved (see toast notification)

### Product doesn't show in recommendations
- Confirm occasion is set correctly
- Ensure product is marked "In Stock"
- Check that user filtered to correct occasion

### Test Uploads Working?
1. Admin: Upload "Test Wedding Dress" with Wedding occasion + photo
2. Refresh app as shopper
3. Go to Trending → filter to Wedding
4. Verify your new product appears with photo
5. Click "Try This Look" to verify it works in fitting studio

## Best Practices

### Photo Tips
- Use clear, professional photos
- Show garment on mannequin or hanger
- Ensure good lighting
- Use consistent backgrounds (light/neutral colors)
- Include full garment view (head to toe for dresses)

### Naming Conventions
- Use clear, descriptive names
- Include material: "Silk", "Cotton", "Satin"
- Include style: "A-Line", "Mermaid", "Fit & Flare"
- Example: "Ivory Silk A-Line Wedding Gown"

### Pricing
- Research competitive pricing
- Consider material quality
- Factor in occasion/season
- Update regularly for sales

### Occasion Selection
- **Wedding**: Bridal dresses, formal gowns, evening wear
- **Formal**: Business suits, corporate attire, cocktail dresses
- **Casual**: Everyday wear, loungewear, casual separates
- **Party**: Club wear, sequined dresses, statement pieces
- **Interview**: Professional blazers, business dresses, dress pants

## Database Fields

When a product is saved, these fields are stored:
- `name`: Garment name (string)
- `category`: top | bottom | footwear | accessories
- `occasion`: Wedding | Casual | Formal | Party | Interview
- `colour`: Color description (string)
- `size`: S | M | L | XL | OS
- `price`: Price in USD (number)
- `imageUrl`: Firebase Storage URL (string) ← **Your uploaded photo**
- `inStock`: Availability (boolean)
- `occasions`: Array of occasions for filtering
- `shapes`: Body shapes item flatters (array)

## Integration Summary

✅ **Complete Flow:**
1. Admin uploads photo → Firebase Storage
2. URL saved to Firestore as `imageUrl`
3. App loads products from Firestore
4. Photo URL displayed in:
   - Trending page (filtered by occasion)
   - Virtual Fitting Studio recommendations
   - PDF export summaries
   - Product cards and catalogs

✅ **Automatic Filtering:**
- Users select occasion → system shows only relevant products
- Your uploaded photos appear immediately
- No manual curation needed

✅ **Real-time Updates:**
- Add product → appears instantly in user feeds
- Edit photo → users see new image on refresh
- Delete product → removes from all views

---

**Questions or issues?** Check Firebase Storage permissions and Firestore database rules.
