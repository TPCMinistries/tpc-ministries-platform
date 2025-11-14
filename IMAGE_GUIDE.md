# TPC Ministries - Image Upload Guide

## Image Folders Created

✅ `/public/images/hero/` - Hero section backgrounds
✅ `/public/images/books/` - Book cover images
✅ `/public/images/missions/` - Mission country photos
✅ `/public/images/team/` - Team member photos (for About page)
✅ `/public/images/logos/` - TPC logo variations

---

## How to Add Your Images

### Option 1: Drag & Drop (Easiest)
1. Open Finder
2. Navigate to: `/Users/lorenzodaughtry-chambers/tpc-ministries-platform/public/images/`
3. Drag your image files into the appropriate folder

### Option 2: Using Terminal
```bash
# From your desktop or downloads folder
cp ~/Desktop/your-image.jpg public/images/hero/
cp ~/Downloads/book-cover.jpg public/images/books/
```

---

## Recommended Image Naming Convention

### Hero Images
- `hero-main.jpg` - Main homepage hero background
- `hero-missions.jpg` - Missions page hero
- `hero-about.jpg` - About page hero

### Book Covers
- `book-1.jpg` - First book
- `book-2.jpg` - Second book
- `book-3.jpg` - Third book
- `book-4.jpg` - Fourth book
(Use descriptive names like `finding-purpose.jpg` if you prefer)

### Mission Photos
- `kenya-1.jpg`, `kenya-2.jpg`, `kenya-3.jpg`
- `south-africa-1.jpg`, `south-africa-2.jpg`
- `grenada-1.jpg`, `grenada-2.jpg`

### Team Photos
- `pastor-name.jpg` (e.g., `pastor-john-smith.jpg`)
- `leader-name.jpg`

### Logos
- `tpc-logo.png` - Main logo with transparency
- `tpc-logo-white.png` - White version for dark backgrounds
- `tpc-logo-gold.png` - Gold version

---

## Recommended Image Sizes

### Hero Backgrounds
- **Size**: 1920x1080px (Full HD)
- **Format**: JPG
- **Max file size**: 500KB (use compression)

### Book Covers
- **Size**: 600x900px (2:3 ratio)
- **Format**: JPG or PNG
- **Max file size**: 200KB

### Mission Photos
- **Size**: 1200x800px (3:2 ratio)
- **Format**: JPG
- **Max file size**: 300KB

### Team Photos
- **Size**: 600x600px (square) or 800x1000px (portrait)
- **Format**: JPG
- **Max file size**: 200KB

### Logos
- **Format**: PNG with transparency
- **Size**: At least 512x512px
- **Max file size**: 100KB

---

## After Uploading Images

Once you've added your images, I'll update the code to use them. The paths will be:

```tsx
// Homepage Hero
<Image src="/images/hero/hero-main.jpg" alt="Hero" />

// Book Covers
<Image src="/images/books/book-1.jpg" alt="Book Title" />

// Mission Photos
<Image src="/images/missions/kenya-1.jpg" alt="Kenya Mission" />

// Team Photos
<Image src="/images/team/pastor-john.jpg" alt="Pastor John" />

// Logo
<Image src="/images/logos/tpc-logo.png" alt="TPC Ministries" />
```

---

## Image Optimization Tips

### Before uploading:
1. **Compress images**: Use tools like TinyPNG, ImageOptim, or Squoosh
2. **Resize appropriately**: Don't upload 5MB images - resize to recommended dimensions
3. **Use correct format**:
   - JPG for photos
   - PNG for logos/graphics with transparency
   - WebP for modern browsers (optional)

### Free Compression Tools:
- https://tinypng.com/
- https://squoosh.app/
- https://imageoptim.com/mac

---

## Quick Upload Steps

1. **Prepare your images** (resize, rename, compress)
2. **Drag into folders**:
   ```
   public/images/hero/       → hero backgrounds
   public/images/books/      → book covers
   public/images/missions/   → country photos
   public/images/team/       → team member photos
   public/images/logos/      → TPC logos
   ```
3. **Tell me what you uploaded** and I'll update the code to display them
4. **Refresh browser** to see your images live

---

## Need Help?

Just let me know:
- What images you have
- What they're for (hero, books, missions, etc.)
- What you want to name them

And I'll update all the code to use your actual images!
