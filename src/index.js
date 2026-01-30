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

      // Store all feed data
      this.feedData = data;
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

  // Helper method to remove all emojis and special characters
  removeEmojis(text) {
    if (!text) return "";
    return text
      .replace(
        /[\u{1F600}-\u{1F64F}]/gu, // Emoticons
        "",
      )
      .replace(
        /[\u{1F300}-\u{1F5FF}]/gu, // Misc Symbols and Pictographs
        "",
      )
      .replace(
        /[\u{1F680}-\u{1F6FF}]/gu, // Transport and Map
        "",
      )
      .replace(
        /[\u{1F1E0}-\u{1F1FF}]/gu, // Flags
        "",
      )
      .replace(
        /[\u{2600}-\u{26FF}]/gu, // Misc symbols
        "",
      )
      .replace(
        /[\u{2700}-\u{27BF}]/gu, // Dingbats
        "",
      )
      .replace(
        /[\u{1F900}-\u{1F9FF}]/gu, // Supplemental Symbols and Pictographs
        "",
      )
      .replace(
        /[\u{1FA00}-\u{1FA6F}]/gu, // Chess Symbols
        "",
      )
      .replace(
        /[\u{1FA70}-\u{1FAFF}]/gu, // Symbols and Pictographs Extended-A
        "",
      )
      .replace(
        /[\u{2300}-\u{23FF}]/gu, // Miscellaneous Technical (includes ⏰)
        "",
      )
      .replace(
        /[\u{2B00}-\u{2BFF}]/gu, // Miscellaneous Symbols and Arrows (includes ⭐)
        "",
      )
      .replace(
        /[\u{FE00}-\u{FE0F}]/gu, // Variation Selectors
        "",
      )
      .replace(
        /[\u{200D}]/gu, // Zero Width Joiner
        "",
      )
      .replace(
        /[\u{20E3}]/gu, // Combining Enclosing Keycap
        "",
      )
      .replace(
        /[\u{E0020}-\u{E007F}]/gu, // Tags
        "",
      )
      .replace(/[ \t]+/g, " ") // Replace multiple spaces/tabs (not newlines) with single space
      .trim();
  }

  // Extract title from caption (first line or sentence)
  extractTitle(caption) {
    if (!caption) return "Instagram Post";

    // Remove emojis comprehensively
    let cleaned = this.removeEmojis(caption);

    // Normalize line endings (convert \r\n to \n)
    cleaned = cleaned.replace(/\r\n/g, "\n");

    // Check if starts with non-alphabetic character (e.g., quote)
    const startsWithNonAlpha = /^[^a-zA-Z]/.test(cleaned);

    // Remove leading non-alphanumeric characters
    cleaned = cleaned.replace(/^[^a-zA-Z0-9]+/, "");

    let endIndex = cleaned.length;

    if (startsWithNonAlpha) {
      // For quoted or special text, extract only first sentence
      const punctuationMatch = cleaned.match(/[.!?]/);
      if (punctuationMatch && punctuationMatch.index > 0) {
        endIndex = punctuationMatch.index + 1;
      }
    } else {
      // For normal text, check for double newline first
      const doubleNewlineIndex = cleaned.indexOf("\n\n");
      if (doubleNewlineIndex > 0) {
        endIndex = doubleNewlineIndex;
      } else {
        // Find first sentence ending punctuation
        const punctuationMatch = cleaned.match(/[.!?]/);
        if (punctuationMatch && punctuationMatch.index > 0) {
          endIndex = punctuationMatch.index + 1;
        } else {
          // Fallback to first line
          const firstNewline = cleaned.indexOf("\n");
          if (firstNewline > 0) {
            endIndex = firstNewline;
          }
        }
      }
    }

    // Extract title
    let title = cleaned.substring(0, endIndex).trim();

    // Remove trailing punctuation and whitespace
    return title.replace(/[.,;:!?]+\s*$/, "").trim();
  }

  // Truncate text to specified length
  truncateText(text, maxLength = 150) {
    if (!text) return "";

    // Remove emojis comprehensively
    let cleaned = this.removeEmojis(text);

    // Normalize line endings (convert \r\n to \n)
    cleaned = cleaned.replace(/\r\n/g, "\n");

    // Check if starts with non-alphabetic character (before removing leading chars)
    const startsWithNonAlpha = /^[^a-zA-Z]/.test(cleaned);

    // Remove leading non-alphanumeric characters
    const originalCleaned = cleaned.replace(/^[^a-zA-Z0-9]+/, "");

    let titleEndIndex = originalCleaned.length;

    if (startsWithNonAlpha) {
      // For quoted text, title is just first sentence
      const punctuationMatch = originalCleaned.match(/[.!?]/);
      if (punctuationMatch && punctuationMatch.index > 0) {
        titleEndIndex = punctuationMatch.index + 1;
        cleaned = originalCleaned.substring(titleEndIndex).trim();
      } else {
        return "";
      }
    } else {
      // For normal text, check for double newline first
      const doubleNewlineIndex = originalCleaned.indexOf("\n\n");
      if (doubleNewlineIndex > 0) {
        titleEndIndex = doubleNewlineIndex;
        cleaned = originalCleaned.substring(titleEndIndex + 2).trim();
      } else {
        const punctuationMatch = originalCleaned.match(/[.!?]/);
        if (punctuationMatch && punctuationMatch.index > 0) {
          titleEndIndex = punctuationMatch.index + 1;
          cleaned = originalCleaned.substring(titleEndIndex).trim();
        } else {
          const firstNewline = originalCleaned.indexOf("\n");
          if (firstNewline > 0) {
            titleEndIndex = firstNewline;
            cleaned = originalCleaned.substring(titleEndIndex + 1).trim();
          } else {
            return "";
          }
        }
      }
    }

    // Remove any leading punctuation, quotes, spaces, or attribution markers
    cleaned = cleaned.replace(/^[""".,;:!?\s–—-]+/, "");

    // Remove attribution if it starts with a dash and name
    cleaned = cleaned.replace(/^[–—-]\s*[A-Z][^,\n]*,?\s*/, "");

    if (!cleaned || cleaned.length <= maxLength) return cleaned;

    // Look ahead for next punctuation mark within 50 chars after limit
    const searchEnd = Math.min(cleaned.length, maxLength + 50);
    const afterLimit = cleaned.substring(maxLength, searchEnd);
    const punctuationMatch = afterLimit.match(/[.!?\n]/);

    if (punctuationMatch) {
      // Cut at the punctuation mark
      const cutPoint = maxLength + punctuationMatch.index + 1;
      return cleaned.substring(0, cutPoint).trim();
    }

    // No punctuation found nearby, truncate at word boundary without ellipsis
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return (
      lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated
    ).trim();
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
        const likes = item.like_count || 0;
        const comments = item.comments_count || 0;
        // Use thumbnail_url for videos, media_url for images and carousels
        const imageUrl = this.escapeHtml(
          item.media_type === "VIDEO" && item.thumbnail_url
            ? item.thumbnail_url
            : item.media_url,
        );
        const permalink = this.escapeHtml(item.permalink);

        return `
        <div class="instagram-card">
          <div class="instagram-card__media" style="background-image: url('${imageUrl}')">
            <img src="${imageUrl}" alt="${this.escapeHtml(title)}" />
          </div>
          <div class="instagram-card__header">
            <div class="instagram-card__engagement">
              <span class="instagram-card__stat">
                <svg class="instagram-card__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#1F1F5F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="instagram-card__count">${likes}</span>
              </span>
              <span class="instagram-card__stat">
                <svg class="instagram-card__icon instagram-card__icon--comment" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#1F1F5F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="instagram-card__count">${comments}</span>
              </span>
            </div>
            <div class="instagram-card__date">${this.escapeHtml(date)}</div>
          </div>
          <div class="instagram-card__body">
            <h3 class="instagram-card__title">${this.escapeHtml(title)}</h3>
            <p class="instagram-card__description">${this.escapeHtml(description)}</p>
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
