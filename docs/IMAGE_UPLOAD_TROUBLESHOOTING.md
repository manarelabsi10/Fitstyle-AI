# 🖼️ Image Upload Troubleshooting Guide

## Common Image Upload Failures

### ❌ Error: "Photo upload failed. Please ensure Firebase Storage rules allow writing."

**Causes:**
1. **Firebase Storage rules not deployed** ✅ FIXED - `storage.rules` file created
2. **User not authenticated** - Admin must be signed in as store owner
3. **Incorrect email domain** - Only specific emails allowed:
   - `dpqusd250103@debi.eui.edu.eg`
   - `*.debi.eui.edu.eg`
   - `*.edu.eg`
   - `*@fitstyle.ai`

---

## How to Fix

### Step 1: Deploy Firebase Storage Rules

Run this command in your terminal:
```bash
firebase deploy --only storage
```

This deploys the `storage.rules` file to Firebase with these permissions:
- ✅ Store owners can upload to `/products/{productId}/{fileName}`
- ✅ All authenticated users can read product images
- ✅ Users can upload temp photos to `/temp/{userId}/{fileName}`

### Step 2: Verify Admin is Signed In

- Check: Admin email matches one of the allowed domains above
- Check: "Store Owner" is selected during login
- Check: No "Permission denied" errors in browser console

### Step 3: Check File Requirements

Accepted formats:
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)

Max file size (before compression):
- File size limit: ~5MB (Firebase default)
- After compression: ~500KB-1MB (auto-resized to 800x800)

---

## Error Messages Decoded

| Error | Cause | Fix |
|-------|-------|-----|
| `storage/permission-denied` | Rules don't allow write | Deploy storage.rules |
| `storage/unauthenticated` | Not signed in | Sign in as store owner |
| `storage/retry-limit-exceeded` | Upload timeout | Retry or use smaller file |
| `storage/invalid-argument` | Bad file format | Use JPG, PNG, or WebP |

---

## Testing Image Upload

### Quick Test Steps:

1. Go to Staff Portal → Store Owner
2. Sign in with: `dpqusd250103@debi.eui.edu.eg` / `password123`
3. Click "Boutique Catalogue" or "Add Garment"
4. Click "📷 Upload Photo"
5. Select an image (JPG, PNG, or WebP)
6. Wait for: "✓ Photo uploaded successfully"

### If Upload Fails:

1. Check browser console (F12 → Console tab) for error code
2. Verify admin email is in allowed list
3. Run `firebase deploy --only storage` to deploy rules
4. Try again

---

## Firebase Storage Configuration

### File Structure
```
gs://gen-lang-client-0681293990.firebasestorage.app/
├── products/
│   └── {productId}/
│       └── {imageName}.jpg  ← Admin uploads here
├── temp/
│   └── {userId}/
│       └── {fileName}  ← User portrait photos
└── wardrobe/
    └── {userId}/
        └── {itemId}/{fileName}  ← User wardrobe items
```

### Security Rules Applied
- Only authenticated users can read product images
- Only store owners can upload to `/products/`
- Users can only upload to their own `/temp/` and `/wardrobe/` folders

---

## Advanced Troubleshooting

### If Still Failing After Deploying Rules:

1. **Check Firebase Console**:
   - Go to: https://console.firebase.google.com
   - Project: `gen-lang-client-0681293990`
   - Storage → Rules tab
   - Verify rules are deployed

2. **Check Authentication**:
   - Console → Authentication → Users tab
   - Verify admin email exists and is enabled

3. **Check Storage**:
   - Console → Storage → Files
   - Look for `/products/` folder
   - Verify it exists (will be created on first upload)

4. **Enable Verbose Logging**:
   - Add to firebase.ts:
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     enableLogging(true);
   }
   ```

---

## Image Upload Performance

### Current Optimizations (Already Implemented)
✅ Automatic image compression: 800x800px, 80% quality  
✅ Async await on Firebase operations  
✅ Loading spinner during upload  
✅ Error messages with specific guidance  

### Upload Speed Timeline
- Image selection: <100ms
- Compression: 200-500ms (on user's device)
- Upload to Firebase: 1-3s (depending on internet)
- Get download URL: 500ms-1s
- **Total: 2-5 seconds**

---

## Summary

**Your setup:**
- ✅ `storage.rules` file created and ready to deploy
- ✅ Error handling with specific error codes
- ✅ Image compression enabled
- ✅ Admin form properly validates uploads

**Next step:**
```bash
firebase deploy --only storage
```

**Then test**: Add a new product with photo in admin dashboard
