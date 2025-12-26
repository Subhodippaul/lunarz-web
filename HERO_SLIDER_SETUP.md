# Hero Slider Setup - 3 Slides Implementation

## ✅ Hero Slider Created

I've updated the hero component to support 3 slides with full slider functionality using the working CSS background method.

## 📁 Required Images

You need to add 2 more images to your public folder:

### Current Setup:
```
public/
├── hero1.png ✅ (already working)
├── hero2.png ❌ (need to add)
└── hero3.png ❌ (need to add)
```

### Image Requirements:
- **Format**: PNG, JPG, or WebP
- **Size**: Recommended 1920x1080 or similar aspect ratio
- **File Size**: Compress to < 1MB each for better performance
- **Naming**: Exactly `hero2.png` and `hero3.png`

## 🎯 Current Slide Configuration

### Slide 1 (Working):
- **Image**: `/hero1.png` ✅
- **Title**: "Premium Oversized T-Shirts"
- **Subtitle**: "Anime • Football • Music • Streetwear"

### Slide 2 (Needs Image):
- **Image**: `/hero2.png` ❌
- **Title**: "Anime Collection"
- **Subtitle**: "Express Your Passion • Premium Quality"

### Slide 3 (Needs Image):
- **Image**: `/hero3.png` ❌
- **Title**: "Sports & Music Tees"
- **Subtitle**: "Show Your Style • Comfort Guaranteed"

## 🚀 Slider Features Implemented

### 1. **Auto-Slide**
- Changes slides every 5 seconds automatically
- Smooth transitions between slides
- Infinite loop (goes back to first slide after last)

### 2. **Manual Navigation**
- **Arrow Buttons**: Left/right arrows for manual control
- **Dot Indicators**: Click dots to jump to specific slide
- **Slide Counter**: Shows current slide (e.g., "2 / 3")

### 3. **Smooth Transitions**
- 500ms duration with ease-in-out timing
- Slides move horizontally (left/right)
- No jarring jumps or flickers

### 4. **Responsive Design**
- Works on all screen sizes
- Touch-friendly navigation buttons
- Proper spacing and sizing

## 🎨 Visual Features

### Background Images:
- **Full Coverage**: Each image covers entire hero section
- **Centered**: Images positioned in center
- **No Distortion**: Maintains aspect ratio with cover

### Text Overlay:
- **Light Overlay**: 30% black overlay for readability
- **Gradient**: Left-to-right gradient for text contrast
- **Drop Shadows**: Text has shadows for better visibility

### Navigation Elements:
- **Semi-transparent**: Buttons blend with background
- **Hover Effects**: Buttons become more opaque on hover
- **Backdrop Blur**: Modern glass effect on buttons

## 🔧 How to Add Images

### Step 1: Prepare Images
1. **Find/Create Images**: Get 2 more hero images
2. **Resize**: Make them 1920x1080 or similar
3. **Compress**: Use tools like TinyPNG.com to reduce file size
4. **Name**: Save as `hero2.png` and `hero3.png`

### Step 2: Add to Public Folder
```bash
# Copy images to public folder
public/hero2.png
public/hero3.png
```

### Step 3: Test Images
- Visit `http://localhost:3000/hero2.png` (should show image)
- Visit `http://localhost:3000/hero3.png` (should show image)

### Step 4: Refresh Website
- The slider should now work with all 3 images
- Auto-slide will cycle through all slides
- Navigation will show 3 dots

## 🎯 Expected Behavior

### With All Images:
1. **Slide 1**: Your current working hero1.png
2. **Slide 2**: New hero2.png with "Anime Collection" text
3. **Slide 3**: New hero3.png with "Sports & Music" text
4. **Auto-cycle**: Every 5 seconds, moves to next slide
5. **Manual Control**: Click arrows or dots to navigate

### Without Additional Images:
- Slides 2 & 3 will show broken image icons
- Slider will still work but look incomplete
- Console may show 404 errors for missing images

## 🛠️ Customization Options

### Change Slide Timing:
```typescript
// In hero.tsx, line ~32
setInterval(() => {
  setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
}, 5000); // Change 5000 to different milliseconds
```

### Update Slide Content:
```typescript
// In hero.tsx, modify heroSlides array
{
  id: 2,
  title: "Your Custom Title",
  subtitle: "Your Custom Subtitle",
  image: "/hero2.png",
},
```

### Add More Slides:
```typescript
// Add more objects to heroSlides array
{
  id: 4,
  title: "Fourth Slide",
  subtitle: "Another slide",
  image: "/hero4.png",
},
```

## 📝 Next Steps

1. **Add Images**: Place `hero2.png` and `hero3.png` in public folder
2. **Test Direct Access**: Visit the image URLs directly
3. **Refresh Website**: Check if slider works with all images
4. **Customize**: Update titles/subtitles if needed

## 🔍 Troubleshooting

### If Images Don't Show:
1. **Check File Names**: Must be exactly `hero2.png` and `hero3.png`
2. **Check File Location**: Must be in `public/` folder
3. **Check File Size**: Large files (>5MB) may load slowly
4. **Clear Cache**: Hard refresh browser (Ctrl+Shift+R)

### If Slider Doesn't Work:
1. **Check Console**: Look for JavaScript errors
2. **Check Image Paths**: Ensure all images are accessible
3. **Restart Server**: `npm run dev`

---

**Status**: ✅ **SLIDER READY** - Add 2 more images (`hero2.png`, `hero3.png`) to public folder and you'll have a fully functional 3-slide hero carousel!