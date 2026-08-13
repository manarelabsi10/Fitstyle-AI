# ⚡ Quick Start Guide - Admin Photo Upload

## Access Admin Dashboard

1. Go to **http://localhost:3000**
2. Click **"Staff Portal"** (bottom of page)
3. Click **"Store Owner"** button
4. Sign in with owner credentials
5. You're in the **Boutique Catalogue** dashboard

---

## Add a New Garment with Photo

### Step 1: Open Add Form
- Click **"+ Add Garment"** (top right, purple button)

### Step 2: Fill Product Details
Fill out the form:
- **Garment Name**: e.g., "Ivory Silk Mermaid Wedding Gown"
- **Category**: Choose one:
  - Top / Outerwear
  - Bottom / Skirt / Trouser
  - Footwear
  - Accessories
- **Occasion Target**: Choose one: ⭐ **IMPORTANT**
  - Wedding
  - Formal
  - Casual  
  - Party
  - Interview
- **Standard Fit Size**: S, M, L, XL, or One Size
- **Premium Colour Swatch**: e.g., "Ivory", "Emerald Green"
- **Retail Price**: e.g., "850"
- **Initial Stock Status**: Check ✓ if available

### Step 3: Upload Photo
- Click **"📷 Upload Photo"** button
- Select image file from your computer
- Wait for success message: **"✓ Photo uploaded successfully"**
- See photo preview appear

### Step 4: Save
- Click **"Save to Catalog"** button
- See confirmation: **"✓ Product added to catalog"**
- ✅ Done! Your product is live!

---

## Where Will Users See It?

### In Trending Combinations
- Users click "Trending Combinations" menu
- See filter buttons: All | Wedding | Formal | Casual | Party
- Click your occasion (e.g., "Wedding")
- Your product appears with uploaded photo
- Users can click "Try This Look" to try-on

### In Virtual Fitting Studio
- User uploads their photo
- Selects same occasion (e.g., "Wedding")
- Your product appears in recommendations
- Shows with uploaded photo
- User can click "Try On" for FASHN AI

### In PDF Export
- User builds outfit with your product
- Clicks "Download Certified PDF summary"
- PDF includes your product with photo

---

## Tips & Best Practices

### Photo Quality
- ✅ Use clear, professional photos
- ✅ Show garment on mannequin or hanger
- ✅ Good lighting, neutral background
- ✅ Full garment view (head to toe for dresses)
- ❌ Don't: Use blurry, cartoons, or models only (need to see garment)

### Naming
- ✅ "Ivory Silk A-Line Wedding Gown"
- ✅ "Emerald Green Satin Formal Blazer"
- ✅ "Black Leather Knee-High Boots"
- ❌ Don't: "Dress", "Top", "Thing"

### Pricing
- Research competitive pricing
- Factor in quality and material
- Update during sales/seasons

### Occasion Selection
Choose the PRIMARY occasion:
- **Wedding**: Bridal dresses, formal gowns, evening wear
- **Formal**: Business suits, corporate attire, cocktail dresses
- **Casual**: Everyday wear, loungewear, casual separates
- **Party**: Club wear, sequined dresses, statement pieces
- **Interview**: Professional blazers, business dresses

---

## File Formats Supported

✅ Accepted:
- PNG (.png)
- JPEG (.jpg, .jpeg)
- WebP (.webp)

❌ Not Supported:
- GIF, BMP, TIFF
- Videos or animated files

**File Size**: Max 5MB per image

---

## If Something Goes Wrong

### "Photo upload failed"
- Check file size < 5MB
- Try different format (JPEG instead of PNG)
- Check internet connection

### "All catalog fields required"
- Verify all form fields filled
- Make sure photo uploaded (not just selected)

### Product doesn't appear for users
- Confirm product saved (see green confirmation)
- Check "In Stock" is checked ✓
- Verify occasion selected correctly
- Refresh browser

### Users don't see uploaded photo, only emoji
- Photo URL may not have synced yet
- Wait 10 seconds, refresh
- Try re-uploading photo
- Use preset template as backup

---

## Preset Image Templates (If No Photo)

You can click these if you don't have a photo ready:
- **Gown Style**: Stock formal wear
- **Pleat Skirt**: Stock skirt photo
- **Satin Blazer**: Stock blazer photo
- **Loafers Shoes**: Stock shoe photo

Then you can edit the product later to add real photos.

---

## Manage Products

### View All Products
Scroll down to see table of all products with:
- Product name
- Category
- Occasion
- Size
- Stock status
- Price

### Search Products
Use the search box at top to find by name

### Filter by Category/Occasion
Use dropdown filters to narrow list

### Edit Product
- Find product in table
- Click pencil icon (✏️)
- Form opens - update details and photo
- Click "Update Garment"

### Delete Product
- Find product in table
- Click trash icon (🗑️)
- Confirm deletion
- Product removed instantly

---

## Bulk Actions

### Select Multiple Products
- Check boxes next to each product
- Or use "Select All" checkbox in table header

### Delete Multiple
- Select products with checkboxes
- Click "Delete Selected" button
- Confirm deletion

---

## Analytics Dashboard

Click **"Sales & Analytics Dashboard"** tab to see:
- Total products in catalog
- Wedding items count
- Average product price
- Total categories (4)
- Low stock/out of stock items

---

## CSV Export

Click **"Export CSV"** button to download:
- Spreadsheet of all products
- Name, Category, Occasion, Size, Price, Stock
- Can import to Excel/Sheets
- Useful for backup

---

## Common Tasks

### Add Wedding Dress Quickly
```
1. Click "Add Garment"
2. Name: Describe the dress
3. Category: Top / Outerwear
4. Occasion: Wedding ← SELECT THIS
5. Price: Wedding dresses typically $200-$1000
6. Upload photo
7. Save
```

### Update Existing Product Photo
```
1. Find product in table
2. Click edit icon (✏️)
3. Click "X" on current photo
4. Upload new photo
5. Click "Update Garment"
```

### Run Inventory Check
```
1. Use Analytics Dashboard tab
2. See "Low Stock / OOS" card
3. Check which items need restocking
4. Edit those products to update stock
```

---

## Account Settings

### Change Password
- Click your profile icon (top right)
- Select "Account Settings"
- Change password section

### View Profile
- Click your profile icon
- See your name and email
- See your store location

### Sign Out
- Click your profile icon
- Select "Sign Out"

---

## Support

If you need help:
1. Check the **ADMIN_PHOTO_UPLOAD_GUIDE.md** for detailed info
2. Check **COMPLETE_PHOTO_UPLOAD_TEST_GUIDE.md** for test scenarios
3. Check Firebase console for storage/database issues
4. Check browser console for error messages (F12 → Console tab)

---

## Pro Tips

💡 **Batch Upload Strategy**
- Upload 3-5 products per session
- Include variety: different occasions
- Mix price points
- Helps algorithm learn your catalog

💡 **Seasonal Updates**
- Update photos for seasons
- Refresh sale prices regularly
- Mark seasonal items in/out of stock
- Users always see current inventory

💡 **Description Through Photos**
- Photo quality = first impression
- Professional photos = higher sales
- Clear product view = more try-ons
- Good lighting = better look

---

**You're ready to go! Start adding products with photos and watch users see them instantly in recommendations.** 🎉
