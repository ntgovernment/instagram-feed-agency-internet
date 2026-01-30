import './styles.css';

/**
 * Instagram Feed Component for Agency Internet
 * This component displays Instagram feed on Squiz Matrix webpages
 */

class InstagramFeed {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('instagram-feed');
    this.feedData = options.feedData || [];
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('Instagram Feed: Container element not found');
      return;
    }
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="instagram-feed-wrapper">
        <h2 class="instagram-feed-title">Instagram Feed</h2>
        <div class="instagram-feed-grid" id="instagram-feed-grid">
          ${this.renderItems()}
        </div>
      </div>
    `;
  }

  renderItems() {
    if (this.feedData.length === 0) {
      return '<p class="instagram-feed-empty">No Instagram posts available</p>';
    }
    return this.feedData.map(item => `
      <div class="instagram-feed-item">
        <img src="${item.image}" alt="${item.caption || 'Instagram post'}" />
        <div class="instagram-feed-caption">${item.caption || ''}</div>
      </div>
    `).join('');
  }

  updateFeed(newData) {
    this.feedData = newData;
    this.render();
  }
}

// Export for use in browser and modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InstagramFeed;
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('instagram-feed')) {
    window.instagramFeed = new InstagramFeed();
  }
});

// Export to window for global access
window.InstagramFeed = InstagramFeed;
