# Mobile Responsiveness Quick Reference

## 📱 Breakpoints

```javascript
Mobile XS:  320px   (default - no prefix)
Mobile S:   375px   (default - no prefix)
Mobile M:   414px   (default - no prefix)
Tablet:     768px   (sm: prefix)
Desktop MD: 1024px  (md: prefix)
Desktop LG: 1280px  (lg: prefix)
Desktop XL: 1920px  (xl: prefix)
```

## 🎨 Common Responsive Patterns

### Responsive Grid Layouts
```astro
<!-- Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols, Large: 4 cols -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => <Card item={item} />)}
</div>
```

### Flex Column to Row
```astro
<!-- Stack on mobile, row on tablet+ -->
<div class="flex flex-col sm:flex-row gap-4">
  <main class="flex-1">Content</main>
  <aside class="sm:w-64">Sidebar</aside>
</div>
```

### Responsive Typography
```astro
<h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
  Responsive Heading
</h1>
<p class="text-sm sm:text-base md:text-lg">
  Body text
</p>
```

### Responsive Spacing
```astro
<!-- Padding: 16px mobile, 48px tablet, 96px desktop -->
<section class="py-4 sm:py-12 md:py-24">
  <!-- Content -->
</section>

<!-- Margin: 8px mobile, 16px tablet, 24px desktop -->
<div class="mb-2 sm:mb-4 md:mb-6">
  <!-- Content -->
</div>
```

### Show/Hide Elements
```astro
<!-- Show on mobile only -->
<div class="block md:hidden">
  <MobileMenu />
</div>

<!-- Hide on mobile, show on tablet+ -->
<div class="hidden md:block">
  <DesktopNav />
</div>

<!-- Hide on mobile and tablet, show on desktop+ -->
<div class="hidden lg:block">
  <Sidebar />
</div>
```

## ✋ Touch Targets (44x44px Minimum)

### Buttons
```astro
<!-- Automatically 44px minimum (global CSS) -->
<button class="px-6 py-2">
  Click Me
</button>

<!-- Explicit sizing for custom buttons -->
<button class="min-h-[44px] min-w-[44px]">
  ×
</button>
```

### Links as Buttons
```astro
<a href="/page" class="inline-flex items-center justify-center min-h-[44px] px-6 py-2">
  Button Link
</a>
```

### Icon Buttons
```astro
<!-- Ensure clickable area is 44x44px -->
<button class="p-3 min-h-[44px] min-w-[44px]">
  <svg class="w-6 h-6"><!-- Icon --></svg>
</button>
```

## 📝 Form Inputs (Mobile-Optimized)

### Text Inputs
```astro
<!-- Automatically 16px font-size to prevent iOS zoom -->
<input 
  type="text" 
  class="w-full px-4 py-3 border rounded-md"
  placeholder="Enter text..."
/>
```

### Search Inputs
```astro
<input 
  type="search" 
  class="w-full px-6 py-4 text-base sm:text-lg border-2 rounded-full"
  placeholder="Search..."
/>
```

### Textarea
```astro
<textarea 
  class="w-full px-4 py-3 border rounded-md min-h-[120px]"
  rows="5"
></textarea>
```

## 🖼️ Responsive Images

### Basic Responsive Image
```astro
<img 
  src={imageUrl} 
  alt="Description"
  class="w-full h-auto"
  loading="lazy"
  decoding="async"
  width="800"
  height="600"
/>
```

### Responsive Container
```astro
<div class="aspect-video overflow-hidden rounded-lg">
  <img 
    src={imageUrl} 
    alt="Description"
    class="w-full h-full object-cover"
  />
</div>
```

### Different Sizes Per Breakpoint
```astro
<div class="w-full sm:w-64 md:w-80 lg:w-96">
  <img src={imageUrl} alt="Description" class="w-full" />
</div>
```

## 🍔 Hamburger Menu Implementation

### Button HTML
```astro
<button 
  id="mobile-menu-button"
  class="md:hidden hamburger-menu p-2"
  aria-label="Toggle menu"
  aria-expanded="false"
>
  <span></span>
  <span></span>
  <span></span>
</button>
```

### CSS (in global.css)
```css
.hamburger-menu span {
  width: 24px;
  height: 2px;
  background-color: currentColor;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-menu.active span:nth-child(1) {
  transform: rotate(45deg) translateY(8px);
}
.hamburger-menu.active span:nth-child(2) {
  opacity: 0;
}
.hamburger-menu.active span:nth-child(3) {
  transform: rotate(-45deg) translateY(-8px);
}
```

### JavaScript Toggle
```javascript
const menuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

menuButton.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  menuButton.classList.toggle('active');
});
```

## 📐 Utility Classes

### Width Constraints
```astro
<!-- Full width on mobile, constrained on desktop -->
<div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

### Responsive Padding
```astro
<!-- Horizontal padding increases with screen size -->
<div class="px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

### Text Alignment
```astro
<!-- Center on mobile, left on desktop -->
<p class="text-center md:text-left">
  Text content
</p>
```

### Truncation
```astro
<!-- Truncate long text on mobile -->
<p class="truncate max-w-[150px] sm:max-w-none">
  Long text that might overflow
</p>

<!-- Line clamp (Tailwind 3.3+) -->
<p class="line-clamp-2 sm:line-clamp-3">
  Multi-line text that gets clamped
</p>
```

## 🧪 Testing Commands

### Start Dev Server
```bash
npm run dev
```

### Test Mobile Responsiveness
```bash
node scripts/test-mobile-responsiveness.js
```

### Manual Testing in Chrome DevTools
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device or enter custom dimensions
4. Test at: 320px, 375px, 768px, 1024px, 1280px

## ⚠️ Common Pitfalls

### ❌ Fixed Widths
```astro
<!-- BAD: Fixed width causes horizontal scroll -->
<div class="w-[800px]">Content</div>

<!-- GOOD: Max width with full width fallback -->
<div class="w-full max-w-[800px]">Content</div>
```

### ❌ Font Size Too Small
```astro
<!-- BAD: iOS will zoom on focus if <16px -->
<input class="text-sm" /> <!-- 14px -->

<!-- GOOD: 16px minimum on inputs -->
<input class="text-base" /> <!-- 16px -->
```

### ❌ Small Touch Targets
```astro
<!-- BAD: Too small for touch -->
<button class="text-sm p-1">×</button>

<!-- GOOD: 44px minimum -->
<button class="min-h-[44px] min-w-[44px] flex items-center justify-center">
  ×
</button>
```

### ❌ Not Mobile-First
```astro
<!-- BAD: Desktop-first approach -->
<div class="grid grid-cols-4 sm:grid-cols-1">

<!-- GOOD: Mobile-first approach -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

## 📊 Accessibility Checklist

- [ ] All interactive elements ≥44x44px
- [ ] Text readable without zoom (16px minimum)
- [ ] Color contrast ≥4.5:1 for text
- [ ] Touch spacing ≥8px between targets
- [ ] Forms labeled properly
- [ ] Focus indicators visible
- [ ] Responsive at 320px - 1920px
- [ ] No horizontal scrolling
- [ ] Images have alt text
- [ ] Heading hierarchy logical

## 🚀 Performance Tips

1. **Lazy Load Images:** `loading="lazy"` on images below fold
2. **Async Decode:** `decoding="async"` on large images
3. **Explicit Dimensions:** Set width/height to prevent CLS
4. **Responsive Breakpoints:** Use `srcset` for different sizes
5. **CSS Containment:** Use `contain: layout` on cards
6. **Reduce Reflows:** Avoid layout shifts on resize

## 📚 Resources

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [WCAG Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

---

**Last Updated:** January 5, 2026  
**Status:** Production Ready ✅
