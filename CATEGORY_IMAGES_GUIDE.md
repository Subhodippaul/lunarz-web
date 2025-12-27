# Category Images Setup Guide

## Required Category Images

To display category images properly, add the following images to your `public/categories/` folder:

### Image Requirements:
- **Format**: JPG, PNG, or WebP
- **Size**: 400x400px (square aspect ratio)
- **Quality**: High resolution for crisp display
- **File Size**: Optimized for web (under 200KB each)

### Required Images:

1. **tshirts.jpg** - T-Shirts category
2. **hoodies.jpg** - Hoodies category  
3. **accessories.jpg** - Accessories category
4. **streetwear.jpg** - Streetwear category
5. **anime.jpg** - Anime category
6. **sports.jpg** - Sports category
7. **music.jpg** - Music category
8. **gaming.jpg** - Gaming category

### Folder Structure:
```
public/
├── categories/
│   ├── tshirts.jpg
│   ├── hoodies.jpg
│   ├── accessories.jpg
│   ├── streetwear.jpg
│   ├── anime.jpg
│   ├── sports.jpg
│   ├── music.jpg
│   └── gaming.jpg
└── loader_logo.png (for the loader component)
```

### Fallback Behavior:
If any category image fails to load, the component will automatically use a fallback image from Unsplash.

### Adding New Categories:
1. Add the image to `public/categories/`
2. Update the `defaultCategories` array in `components/category-carousel.tsx`
3. Ensure the `slug` matches your product category names (lowercase, hyphenated)

### Image Sources:
You can use:
- **Unsplash** (free): https://unsplash.com/
- **Pexels** (free): https://pexels.com/
- **Custom photography**
- **Stock photo services**

### SEO Tips:
- Use descriptive filenames
- Optimize images for web
- Consider WebP format for better compression
- Add proper alt text (handled automatically by component)