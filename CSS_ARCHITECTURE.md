# Instagram Feed - Modular CSS Architecture

## Overview

The Instagram Feed widget now uses a **modular CSS architecture** with Bootstrap 4-compatible button customization using **CSS Custom Properties (CSS Variables)**. This enables easier theme customization and better maintainability.

## Directory Structure

```
src/
├── styles/
│   ├── variables.css          # CSS custom properties for theming
│   ├── buttons.css            # Button customizations (Bootstrap 4 compatible)
│   ├── instagram-feed.css     # Instagram Feed & Modal component styles
│   └── main.css               # Imports all modular files
├── styles.css                 # Entry point (imports styles/main.css)
├── index.js                   # JavaScript component
└── data.json                  # Instagram feed data
```

## CSS Modules

### 1. **variables.css** - Design System Variables

Defines all CSS custom properties for consistent theming:

```css
:root {
  /* Brand Colors */
  --dpsc-primary: #c33826;
  --dpsc-primary-hover: #a72f1f;
  --dpsc-primary-active: #8c2619;

  /* Button Variables */
  --btn-primary-bg: var(--dpsc-primary);
  --btn-primary-hover-bg: var(--dpsc-primary-hover);

  /* Spacing, Typography, Transitions */
  --spacing-lg: 24px;
  --font-family-base: Lato, ...;
  --transition-base: 0.2s ease;
}
```

### 2. **buttons.css** - Bootstrap 4 Button Customization

Scoped button styling to avoid conflicts with the NT.gov.au framework:

```css
.instagram-feed .btn-primary,
.instagram-modal .btn-primary {
  background-color: var(--btn-primary-bg);
  border-color: var(--btn-primary-border);
  color: var(--btn-primary-color);
}
```

**Key Features:**

- ✅ **Scoped** to `.instagram-feed` and `.instagram-modal` - won't affect other Bootstrap buttons
- ✅ **All states covered**: default, hover, focus, active, disabled
- ✅ **Bootstrap 4 compatible** - works with existing NT.gov.au framework
- ✅ **CSS Variables** - easy to customize without touching CSS

### 3. **instagram-feed.css** - Component Styles

All Instagram Feed and Modal component styles using CSS variables for consistent theming.

### 4. **main.css** - Import Controller

Defines the import order:

1. Variables (must be first)
2. Button customizations
3. Component styles

## Customization Guide

### Changing the Primary Color

To change the brand color (currently #c33826), edit `src/styles/variables.css`:

```css
:root {
  --dpsc-primary: #YOUR_COLOR_HERE;
  --dpsc-primary-hover: #DARKER_SHADE;
  --dpsc-primary-active: #EVEN_DARKER;
}
```

All buttons and brand elements update automatically!

### Changing Button Styling

Edit `src/styles/buttons.css` to customize:

- Padding
- Font weight
- Border radius
- Box shadows
- Icon spacing

### Changing Spacing

Update spacing variables in `src/styles/variables.css`:

```css
:root {
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 40px;
}
```

## Benefits

### 🎨 **Easy Theming**

Change colors, spacing, and typography in one place (variables.css)

### 📦 **Modular**

Each concern separated into its own file:

- Variables → Design tokens
- Buttons → Bootstrap customization
- Instagram Feed → Component logic

### 🔒 **Scoped**

Button customizations won't conflict with NT.gov.au framework

### 🚀 **Maintainable**

Clear separation makes updates easier and safer

### ♿ **Accessible**

Maintains Bootstrap 4's accessibility features (focus states, aria attributes)

## Bootstrap Compatibility

### Current: Bootstrap 4.1.3 (NT.gov.au Framework)

- ✅ Compatible with existing infrastructure
- ✅ No changes required to index.html
- ✅ Works alongside global Bootstrap styles
- ✅ Uses jQuery modal API (existing NT.gov.au dependency)

### Button States Supported

- ✅ Default
- ✅ Hover
- ✅ Focus (keyboard navigation)
- ✅ Active (pressed)
- ✅ Disabled

## Build Commands

```bash
# Development server
npm run serve

# Production build
npm run build
```

## File Sizes (Production Build)

- `variables.css`: ~1.3 KB
- `buttons.css`: ~2.5 KB
- `instagram-feed.css`: ~8.0 KB
- **Total CSS**: ~12.6 KB

## Migration from Old Structure

### Before

```
src/styles.css (everything in one file)
```

### After

```
src/
├── styles.css (entry point - imports modular files)
└── styles/
    ├── variables.css
    ├── buttons.css
    ├── instagram-feed.css
    └── main.css
```

## Browser Support

Same as Bootstrap 4.1.3:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- IE 11 (with CSS variable fallbacks)

## Notes

### CSS Variable Fallbacks

All CSS variables include fallback values:

```css
color: var(--dpsc-primary, #c33826);
```

This ensures compatibility even if variables don't load.

### Webpack Configuration

No changes required - Webpack automatically processes `@import` statements.

### Future Bootstrap 5 Migration

This structure is designed to make future Bootstrap 5 migration easier:

- CSS variables align with Bootstrap 5's approach
- Modular structure separates concerns
- Scoped customizations minimize upgrade conflicts

## Questions?

For customization help or issues, check:

1. Webpack build output for CSS errors
2. Browser DevTools to inspect applied styles
3. `variables.css` for available customization options
