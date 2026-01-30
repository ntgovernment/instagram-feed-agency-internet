import "./styles.css";

/**
 * Instagram Feed Component for Agency Internet
 * This component displays Instagram feed on Squiz Matrix webpages
 */

class InstagramFeed {
  constructor(options = {}) {
    this.container =
      options.container || document.querySelector("[data-securent-fb-widget]");
    this.apiUrl =
      options.apiUrl || (this.container ? this.container.dataset.apiUrl : null);
    this.feedData = options.feedData || [];
    this.init();
  }

  async init() {
    if (!this.container) {
      console.error("Instagram Feed: Container element not found");
      return;
    }

    // Fetch feed data if API URL is provided
    if (this.apiUrl) {
      await this.fetchFeed();
    }

    this.render();
  }

  async fetchFeed() {
    try {
      // Check if we're in development mode (localhost or webpack dev server)
      const isDevelopment =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.port === "8080";

      let data;

      if (isDevelopment) {
        // In development, use local data.json to avoid CORS
        console.log(
          "Instagram Feed: Development mode - loading from data.json",
        );
        const localData = await import("./data.json");
        data = localData.default || localData;
      } else {
        // In production, fetch from API
        const response = await fetch(this.apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        data = await response.json();
      }

      // Filter for images only
      this.feedData = data.filter((post) => post.media_type === "IMAGE");
    } catch (error) {
      console.error("Instagram Feed: Error fetching data", error);
      this.feedData = [];
    }
  }

  // Helper method to escape HTML to prevent XSS
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text ? String(text).replace(/[&<>"']/g, (m) => map[m]) : "";
  }

  // Extract title from caption (first line or sentence)
  extractTitle(caption) {
    if (!caption) return "Instagram Post";

    // Remove emojis and clean the caption
    const cleaned = caption
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
        "",
      )
      .trim();

    // Get first line or first sentence
    const firstLine = cleaned.split("\n")[0];
    const firstSentence = firstLine.split(/[.!?]/)[0];

    // Use the shorter one, truncate if too long
    const title =
      firstSentence.length < firstLine.length ? firstSentence : firstLine;
    return title.length > 80 ? title.substring(0, 77) + "..." : title;
  }

  // Truncate text to specified length
  truncateText(text, maxLength = 150) {
    if (!text) return "";

    // Remove emojis
    const cleaned = text
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
        "",
      )
      .trim();

    if (cleaned.length <= maxLength) return cleaned;

    // Truncate at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return (
      (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "..."
    );
  }

  // Format ISO date to "17 Feb 2025" format
  formatDate(isoString) {
    const date = new Date(isoString);
    const day = date.getDate();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  // Get media type label for tag
  getMediaTypeLabel(mediaType) {
    const labels = {
      IMAGE: "Image",
      VIDEO: "Video",
      CAROUSEL_ALBUM: "Carousel",
    };
    return labels[mediaType] || "Post";
  }

  render() {
    this.container.innerHTML = `
      <div class="instagram-feed-grid">
        ${this.renderItems()}
      </div>
    `;
  }

  renderItems() {
    if (this.feedData.length === 0) {
      return '<p class="instagram-feed-empty">No Instagram posts available</p>';
    }

    return this.feedData
      .map((item) => {
        const title = this.extractTitle(item.caption);
        const description = this.truncateText(item.caption, 150);
        const date = this.formatDate(item.timestamp);
        const tag = this.getMediaTypeLabel(item.media_type);
        const imageUrl = this.escapeHtml(item.media_url);
        const permalink = this.escapeHtml(item.permalink);

        return `
        <div class="instagram-card">
          <div class="instagram-card__media" style="background-image: url('${imageUrl}')">
            <img src="${imageUrl}" alt="${this.escapeHtml(title)}" />
          </div>
          <div class="instagram-card__header">
            <div class="instagram-card__tag-wrapper">
              <span class="instagram-card__tag instagram-card__tag--blue">${this.escapeHtml(tag)}</span>
            </div>
            <div class="instagram-card__date">${this.escapeHtml(date)}</div>
          </div>
          <div class="instagram-card__body">
            <h3 class="instagram-card__title">${this.escapeHtml(title)}</h3>
            <p class="instagram-card__description">${this.escapeHtml(description)}</p>
          </div>
          <div class="instagram-card__footer">
            <a href="${permalink}" target="_blank" rel="noopener noreferrer" class="instagram-card__link">
              <span class="instagram-card__link-text">Find out more</span>
              <svg class="instagram-card__link-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.66667 3.33333L13.3333 8L8.66667 12.6667M12.6667 8H2.66667" stroke="#1F1F5F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      `;
      })
      .join("");
  }

  updateFeed(newData) {
    this.feedData = newData;
    this.render();
  }
}

// Export for use in browser and modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = InstagramFeed;
}

// Auto-initialize if container exists
document.addEventListener("DOMContentLoaded", () => {
  const widgetElement = document.querySelector("[data-securent-fb-widget]");
  if (widgetElement) {
    window.instagramFeed = new InstagramFeed();
  }
});

// Export to window for global access
window.InstagramFeed = InstagramFeed;
