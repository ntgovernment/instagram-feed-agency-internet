# Instagram Feed - Agency Internet

Instagram feed Squiz Matrix component template for agency internet. This project provides redistributable JS and CSS bundles that can be referenced in Squiz Matrix webpages via Git File Bridge.

## Features

- 📦 Webpack bundler for production-ready JS and CSS
- 🔥 Development server with hot reload
- 📱 Responsive design
- 🎨 Modern Instagram-like grid layout
- 🔧 Easy integration with Squiz Matrix

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Development

Run the development server with hot reload:

```bash
npm run serve
```

This will start the development server at `http://localhost:8080` with automatic browser refresh on file changes.

### Production Build

Build redistributable JS and CSS files:

```bash
npm run build
```

The production files will be generated in the `dist/` directory:
- `instagram-feed.bundle.js` - Minified JavaScript bundle
- `instagram-feed.bundle.css` - Minified CSS bundle
- `*.map` files - Source maps for debugging

## Usage in Squiz Matrix

### Via Git File Bridge

1. Build the production files using `npm run build`
2. The files in the `dist/` directory can be synced to Squiz Matrix via Git File Bridge
3. Reference the bundled files in your Squiz Matrix pages:

```html
<!-- Add to your page head -->
<link rel="stylesheet" href="path/to/instagram-feed.bundle.css">

<!-- Add to your page body -->
<div id="instagram-feed"></div>

<!-- Add before closing body tag -->
<script src="path/to/instagram-feed.bundle.js"></script>

<!-- Initialize with your data -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const feed = new InstagramFeed({
      container: document.getElementById('instagram-feed'),
      feedData: [
        {
          image: 'https://example.com/image1.jpg',
          caption: 'Your caption here'
        },
        // Add more posts...
      ]
    });
  });
</script>
```

### Component API

#### Constructor Options

```javascript
new InstagramFeed({
  container: HTMLElement,  // Container element (default: #instagram-feed)
  feedData: Array          // Array of Instagram post objects
})
```

#### Post Object Structure

```javascript
{
  image: 'https://example.com/image.jpg',  // Image URL
  caption: 'Post caption text'             // Caption text (optional)
}
```

#### Methods

- `updateFeed(newData)` - Update the feed with new data

## Project Structure

```
.
├── src/
│   ├── index.js       # Main JavaScript component
│   ├── styles.css     # Component styles
│   └── index.html     # Development HTML template
├── dist/              # Production build output (generated)
├── webpack.config.js  # Webpack configuration
└── package.json       # Project dependencies and scripts
```

## Development Workflow

1. Make changes to source files in `src/`
2. Run `npm run serve` to test changes in development mode
3. Build with `npm run build` when ready for production
4. Deploy the `dist/` files to Squiz Matrix via Git File Bridge

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills if needed)

## License

ISC
