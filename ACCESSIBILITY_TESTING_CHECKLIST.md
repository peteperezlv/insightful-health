# WCAG 2.1 AA Accessibility Testing Checklist
## Insightful Health Platform

Use this checklist to verify accessibility compliance when testing the platform.

---

## 🎯 Automated Testing

### Lighthouse Audit
- [ ] Open Chrome DevTools (F12)
- [ ] Navigate to "Lighthouse" tab
- [ ] Check "Accessibility" category only
- [ ] Run audit on homepage
- [ ] Run audit on /posts page
- [ ] Run audit on individual post page
- [ ] Run audit on /archive page
- [ ] **Target Score:** 95+ for all pages

### axe DevTools Extension
- [ ] Install axe DevTools browser extension
- [ ] Run scan on homepage
- [ ] Run scan on key pages
- [ ] Review and fix any Critical or Serious issues
- [ ] **Target:** 0 critical violations

### WAVE Extension
- [ ] Install WAVE browser extension
- [ ] Scan homepage
- [ ] Review errors (red icons)
- [ ] Review alerts (yellow icons)
- [ ] Check ARIA implementation
- [ ] **Target:** 0 errors

---

## ⌨️ Keyboard Navigation Testing

### Basic Navigation
- [ ] Press Tab - focus should move to "Skip to main content" link
- [ ] Press Enter on skip link - page should scroll to main content
- [ ] Tab through all navigation links
- [ ] Tab reaches logo (link to homepage)
- [ ] Tab reaches search button
- [ ] Tab reaches login/signup or user menu
- [ ] All interactive elements receive visible focus indicator

### User Menu (when logged in)
- [ ] Tab to user menu button
- [ ] Press Enter or Space - dropdown menu should open
- [ ] `aria-expanded="true"` when open
- [ ] Tab through menu items (Dashboard, Profile, Settings, etc.)
- [ ] Press Escape - dropdown should close and focus returns to button
- [ ] Click outside - dropdown closes

### Mobile Menu
- [ ] Tab to mobile menu button (on mobile viewport)
- [ ] Press Enter - mobile menu expands
- [ ] Tab through mobile menu links
- [ ] Press Escape - menu closes
- [ ] Focus returns to mobile menu button

### Forms
- [ ] Tab to newsletter email input
- [ ] Type email address
- [ ] Tab to Submit button
- [ ] Press Enter - form should submit
- [ ] Error message should be announced to screen readers
- [ ] Success message should be announced

### Links & Buttons
- [ ] All links can be activated with Enter
- [ ] All buttons can be activated with Space or Enter
- [ ] No keyboard traps (can tab out of all sections)
- [ ] Tab order follows visual order

---

## 📱 Screen Reader Testing

### Windows (NVDA - Free)
Download: https://www.nvaccess.org/download/

**Basic Navigation:**
- [ ] Start NVDA
- [ ] Press H - navigate by headings
- [ ] Press L - navigate by links
- [ ] Press F - navigate by form fields
- [ ] Press B - navigate by buttons
- [ ] Press R - navigate by landmarks (banner, navigation, main, contentinfo)

**Content Verification:**
- [ ] NVDA announces skip link on page load
- [ ] Header is announced as "banner landmark"
- [ ] Navigation is announced as "navigation landmark"
- [ ] Main content is announced as "main landmark"
- [ ] Footer is announced as "contentinfo landmark"
- [ ] Images announce proper alt text
- [ ] Decorative icons are silent (aria-hidden)
- [ ] Form labels are read with inputs
- [ ] Required fields announce "required"
- [ ] Error messages are announced immediately
- [ ] Success messages are announced
- [ ] Link purposes are clear without context

### Windows (JAWS - Commercial)
Similar testing to NVDA with JAWS-specific commands.

### macOS (VoiceOver - Built-in)
**Enable:** Cmd + F5

**Basic Commands:**
- [ ] VO + A - read from current position
- [ ] VO + Right Arrow - next item
- [ ] VO + Left Arrow - previous item
- [ ] VO + U - open rotor (headings, links, landmarks)
- [ ] VO + Space - activate element

**Testing:**
- [ ] All NVDA tests above
- [ ] Verify VoiceOver announces all ARIA labels
- [ ] Test on Safari (primary macOS browser)

### iOS (VoiceOver)
**Enable:** Settings > Accessibility > VoiceOver

**Gestures:**
- [ ] Swipe right - next item
- [ ] Swipe left - previous item
- [ ] Double tap - activate
- [ ] Rotor (two fingers rotate) - navigate by headings/links

### Android (TalkBack)
**Enable:** Settings > Accessibility > TalkBack

**Testing:**
- [ ] Swipe navigation works
- [ ] All content is announced
- [ ] Focus order is logical

---

## 🎨 Color Contrast Testing

### Manual Checks
- [ ] Install WebAIM Contrast Checker extension
- [ ] Check primary text (#111827 on white) - Should be 16.1:1 ✅
- [ ] Check secondary text (#4B5563 on white) - Should be 7.2:1 ✅
- [ ] Check emerald-600 (#10b981) on white - Should pass AA
- [ ] Check all button text colors
- [ ] Check placeholder text (must meet 4.5:1)
- [ ] Check link text colors
- [ ] Check error messages (red text)
- [ ] Check success messages (green text)

### Automated Checks
- [ ] Run Lighthouse audit - checks for contrast issues
- [ ] Run axe DevTools - identifies low contrast elements
- [ ] WAVE extension shows contrast warnings

---

## 📏 Zoom & Reflow Testing

### Text Zoom (200%)
- [ ] Chrome: Ctrl/Cmd + (zoom to 200%)
- [ ] Text remains readable
- [ ] No text is cut off
- [ ] No overlapping text
- [ ] All functionality still works
- [ ] Forms remain usable

### Viewport Resize
- [ ] Open DevTools responsive mode
- [ ] Test at 320px width (iPhone SE)
- [ ] Test at 375px width (iPhone X)
- [ ] Test at 768px width (iPad)
- [ ] Test at 1024px width (iPad Pro)
- [ ] Test at 1920px width (Desktop)
- [ ] No horizontal scrolling at any width
- [ ] Content reflows appropriately
- [ ] Mobile menu appears on small screens
- [ ] All touch targets are 44x44px minimum

---

## 🎬 Motion & Animation Testing

### Reduced Motion Preference
**Enable on macOS:** System Preferences > Accessibility > Display > Reduce motion  
**Enable on Windows:** Settings > Ease of Access > Display > Show animations  

**Testing:**
- [ ] Enable reduced motion in OS settings
- [ ] Reload the website
- [ ] Hover effects should have minimal/no animation
- [ ] Transitions should be instant or very brief
- [ ] Scroll behavior should be instant (not smooth)
- [ ] No auto-playing animations

### Animation Review
- [ ] All animations are subtle (no flashing)
- [ ] No content flashes more than 3 times per second
- [ ] Parallax scrolling disabled with reduced motion
- [ ] Auto-advancing carousels can be paused

---

## 📝 Form Accessibility Testing

### Newsletter Form (3 variants)
**Default Variant (Homepage):**
- [ ] Click in email input - label is associated
- [ ] Leave email empty and submit - error appears
- [ ] Error message is announced to screen readers
- [ ] Error has `role="alert"` and `aria-live="assertive"`
- [ ] Input has `aria-invalid="true"` on error
- [ ] Input has `aria-describedby` pointing to error ID
- [ ] Enter valid email and submit - success appears
- [ ] Success message announced with `role="status"`
- [ ] Form resets after successful submission

**Inline Variant:**
- [ ] Same testing as default
- [ ] Check that label is present (even if visually hidden)
- [ ] Button is large enough (44x44px)

**Footer Variant:**
- [ ] Same testing as default
- [ ] Contrast is sufficient on dark background
- [ ] Placeholder text is visible

### Login/Signup Forms (if applicable)
- [ ] All inputs have visible labels
- [ ] Required fields marked with `aria-required="true"`
- [ ] Password field has show/hide button
- [ ] Show/hide button has proper ARIA label
- [ ] Error messages are specific and helpful
- [ ] Success confirmation after submission

---

## 🔍 Semantic HTML Testing

### Document Structure
Open DevTools Elements panel and verify:

- [ ] Single `<h1>` per page (usually page title)
- [ ] Heading hierarchy is logical (h1 > h2 > h3, no skipping levels)
- [ ] `<header>` element with `role="banner"` exists
- [ ] `<nav>` element with `role="navigation"` exists
- [ ] `<main>` element with `id="main-content"` exists
- [ ] `<footer>` element with `role="contentinfo"` exists
- [ ] `<article>` used for blog post cards
- [ ] `<time>` elements have `datetime` attribute
- [ ] Lists use `<ul>`, `<ol>`, or `<dl>` appropriately
- [ ] No generic `<div>` where semantic element would work

### Links & Buttons
- [ ] Links (`<a>`) navigate to new pages/sections
- [ ] Buttons (`<button>`) perform actions
- [ ] No `<div>` or `<span>` used for clickable items
- [ ] All links have descriptive text (not "click here")
- [ ] Links to external sites have `rel="noopener"` (if target="_blank")

---

## 🌐 ARIA Testing

### ARIA Roles
Check in DevTools Elements panel:

- [ ] `role="banner"` on header
- [ ] `role="navigation"` on nav elements
- [ ] `role="main"` on main content (or implicit from `<main>`)
- [ ] `role="contentinfo"` on footer
- [ ] `role="article"` on blog post cards
- [ ] `role="menu"` on dropdown menus
- [ ] `role="menuitem"` on menu items
- [ ] `role="alert"` on error messages
- [ ] `role="status"` on success messages
- [ ] `role="separator"` on visual dividers in menus

### ARIA Attributes
- [ ] `aria-label` on icon-only buttons
- [ ] `aria-labelledby` for complex components
- [ ] `aria-describedby` linking inputs to help text
- [ ] `aria-expanded` on dropdowns (changes true/false)
- [ ] `aria-haspopup` on menu triggers
- [ ] `aria-controls` linking buttons to panels
- [ ] `aria-hidden="true"` on decorative SVGs
- [ ] `aria-required="true"` on required form fields
- [ ] `aria-invalid="true"` on fields with errors
- [ ] `aria-live="polite"` on success messages
- [ ] `aria-live="assertive"` on error messages

### ARIA Best Practices
- [ ] No redundant roles (e.g., `<button role="button">`)
- [ ] ARIA doesn't override semantic HTML
- [ ] ARIA states update dynamically (aria-expanded, etc.)
- [ ] No ARIA on elements that don't need it

---

## 📱 Touch Target Testing

### Minimum Size (44x44px)
Use DevTools to measure:

- [ ] All buttons are at least 44x44px
- [ ] All links have adequate padding (44x44px clickable area)
- [ ] Form inputs are at least 44px tall
- [ ] Dropdown triggers are large enough
- [ ] Icon buttons meet size requirements
- [ ] Mobile menu button is large enough
- [ ] Close buttons in modals are large enough

### Spacing
- [ ] Touch targets have at least 8px spacing between them
- [ ] No adjacent small targets

---

## 🧪 Manual Testing Scenarios

### Scenario 1: First-Time Visitor (Keyboard Only)
1. [ ] Land on homepage
2. [ ] Tab to skip link and activate
3. [ ] Navigate through featured posts
4. [ ] Navigate to recent posts
5. [ ] Subscribe to newsletter
6. [ ] Navigate to footer links

### Scenario 2: Screen Reader User (NVDA)
1. [ ] Start NVDA
2. [ ] Navigate by landmarks (banner, navigation, main)
3. [ ] Listen to homepage hero section
4. [ ] Navigate featured posts by heading
5. [ ] Fill out newsletter form
6. [ ] Navigate footer

### Scenario 3: Low Vision User (High Zoom)
1. [ ] Zoom to 200%
2. [ ] Navigate entire homepage
3. [ ] Read a blog post
4. [ ] Submit newsletter form
5. [ ] Verify no horizontal scrolling

### Scenario 4: Mobile User (Touch Only)
1. [ ] Open on mobile device
2. [ ] Tap mobile menu
3. [ ] Navigate to blog post
4. [ ] Interact with all touch targets
5. [ ] Submit forms

---

## 🚀 Deployment Checklist

Before going live:

- [ ] All automated tests pass (Lighthouse 95+, axe 0 critical)
- [ ] Keyboard navigation tested thoroughly
- [ ] Screen reader tested on at least one platform
- [ ] Color contrast verified
- [ ] Zoom and reflow tested
- [ ] Reduced motion preference respected
- [ ] All forms are accessible
- [ ] Touch targets meet 44x44px minimum
- [ ] Semantic HTML structure validated
- [ ] ARIA implementation verified
- [ ] Documentation completed (ACCESSIBILITY_COMPLIANCE.md)

---

## 📊 Results Tracking

### Lighthouse Scores (Target: 95+)

| Page | Score | Date | Notes |
|------|-------|------|-------|
| Homepage | ___ | ___ | ___ |
| /posts | ___ | ___ | ___ |
| /post/[slug] | ___ | ___ | ___ |
| /archive | ___ | ___ | ___ |
| /authors | ___ | ___ | ___ |

### axe DevTools Results

| Page | Critical | Serious | Moderate | Minor | Date |
|------|----------|---------|----------|-------|------|
| Homepage | ___ | ___ | ___ | ___ | ___ |
| /posts | ___ | ___ | ___ | ___ | ___ |
| /post/[slug] | ___ | ___ | ___ | ___ | ___ |

### Screen Reader Testing

| Platform | Tester | Date | Issues Found | Status |
|----------|--------|------|--------------|--------|
| NVDA | ___ | ___ | ___ | ___ |
| JAWS | ___ | ___ | ___ | ___ |
| VoiceOver (macOS) | ___ | ___ | ___ | ___ |
| VoiceOver (iOS) | ___ | ___ | ___ | ___ |
| TalkBack | ___ | ___ | ___ | ___ |

---

## 🔧 Common Issues & Fixes

### Issue: Lighthouse score below 95
**Fix:** Run axe scan to identify specific issues, review console for ARIA errors

### Issue: Screen reader not announcing element
**Fix:** Check for proper ARIA labels, ensure element is not hidden, verify semantic HTML

### Issue: Keyboard trap
**Fix:** Check for modals without close buttons, ensure all popups can be closed with Escape

### Issue: Low color contrast
**Fix:** Use WebAIM contrast checker, adjust colors to meet 4.5:1 ratio

### Issue: Text overlaps at 200% zoom
**Fix:** Use relative units (rem, em), test responsive design at various zoom levels

---

**Last Updated:** 2025-01-02  
**Next Review:** Before each major release
