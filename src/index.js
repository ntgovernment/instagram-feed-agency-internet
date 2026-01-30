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

    // Check if starts with non-alphanumeric character (e.g., quote, emoji)
    const startsWithNonAlpha = /^[^a-zA-Z0-9]/.test(cleaned);

    // Remove leading non-alphanumeric characters
    cleaned = cleaned.replace(/^[^a-zA-Z0-9]+/, "");

    let endIndex = cleaned.length;

    if (startsWithNonAlpha) {
      // For quoted or special text, extract only first sentence
      const periodIndex = cleaned.indexOf(".");
      const exclamationIndex = cleaned.indexOf("!");
      const questionIndex = cleaned.indexOf("?");

      // Find first valid punctuation mark
      const validIndices = [
        periodIndex,
        exclamationIndex,
        questionIndex,
      ].filter((idx) => idx > 0);

      if (validIndices.length > 0) {
        endIndex = Math.min(...validIndices);
      }
    } else {
      // For normal text, find first terminator (punctuation or double newline)
      const periodIndex = cleaned.indexOf(".");
      const exclamationIndex = cleaned.indexOf("!");
      const questionIndex = cleaned.indexOf("?");
      const doubleNewlineIndex = cleaned.indexOf("\n\n");

      // Collect all valid terminators
      const validIndices = [
        periodIndex,
        exclamationIndex,
        questionIndex,
        doubleNewlineIndex,
      ].filter((idx) => idx > 0);

      if (validIndices.length > 0) {
        // Use the first terminator found
        endIndex = Math.min(...validIndices);
      } else {
        // Fallback to first line
        const firstNewline = cleaned.indexOf("\n");
        if (firstNewline > 0) {
          endIndex = firstNewline;
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

    // Check if starts with non-alphanumeric character (before removing leading chars)
    const startsWithNonAlpha = /^[^a-zA-Z0-9]/.test(cleaned);

    // Remove leading non-alphanumeric characters
    const originalCleaned = cleaned.replace(/^[^a-zA-Z0-9]+/, "");

    let titleEndIndex = originalCleaned.length;

    if (startsWithNonAlpha) {
      // For quoted text, title is just first sentence
      const periodIndex = originalCleaned.indexOf(".");
      const exclamationIndex = originalCleaned.indexOf("!");
      const questionIndex = originalCleaned.indexOf("?");

      // Find first valid punctuation mark
      const validIndices = [
        periodIndex,
        exclamationIndex,
        questionIndex,
      ].filter((idx) => idx > 0);

      if (validIndices.length > 0) {
        titleEndIndex = Math.min(...validIndices) + 1;
        cleaned = originalCleaned.substring(titleEndIndex).trim();
      } else {
        return "";
      }
    } else {
      // For normal text, find first terminator (punctuation or double newline)
      const periodIndex = originalCleaned.indexOf(".");
      const exclamationIndex = originalCleaned.indexOf("!");
      const questionIndex = originalCleaned.indexOf("?");
      const doubleNewlineIndex = originalCleaned.indexOf("\n\n");

      // Collect all valid terminators
      const validIndices = [
        periodIndex,
        exclamationIndex,
        questionIndex,
        doubleNewlineIndex,
      ].filter((idx) => idx > 0);

      if (validIndices.length > 0) {
        // Use the first terminator found
        titleEndIndex = Math.min(...validIndices);
        // Skip past the terminator (and extra newline if double newline)
        const skipLength = titleEndIndex === doubleNewlineIndex ? 2 : 1;
        cleaned = originalCleaned.substring(titleEndIndex + skipLength).trim();
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

  // Convert URLs, @mentions, and #hashtags to clickable hyperlinks
  convertTextToLinks(text) {
    if (!text) return "";

    // First, escape HTML to prevent XSS attacks
    let escaped = this.escapeHtml(text);

    // Convert URLs to links
    // Matches URLs with or without protocol, including multi-level domains like youth.nt.gov.au
    escaped = escaped.replace(
      /(https?:\/\/[^\s<>"]+|(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z0-9][-a-zA-Z0-9]*)+(?:\/[^\s<>"]*)?)/gi,
      (url) => {
        // Remove trailing punctuation that's likely not part of the URL
        let cleanUrl = url.replace(/[.,;:!?)]$/, "");
        let href = cleanUrl;

        // Add protocol if missing
        if (!cleanUrl.match(/^https?:\/\//i)) {
          href = "https://" + cleanUrl;
        }

        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>${url.slice(cleanUrl.length)}`;
      },
    );

    // Convert @mentions to Instagram profile links
    escaped = escaped.replace(
      /@([a-zA-Z0-9._]{1,30})\b/g,
      '<a href="https://instagram.com/$1" target="_blank" rel="noopener noreferrer">@$1</a>',
    );

    // Convert #hashtags to Instagram tag search links
    // Negative lookbehind (?<!&) prevents matching HTML entities like &#039;
    // Hashtags must start with a letter (not a number)
    escaped = escaped.replace(
      /(?<!&)#([a-zA-Z][a-zA-Z0-9_]*)\b/g,
      '<a href="https://instagram.com/explore/tags/$1" target="_blank" rel="noopener noreferrer">#$1</a>',
    );

    return escaped;
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
      <!-- Instagram Post Modal -->
      <div class="modal fade instagram-modal" id="instagram-modal" tabindex="-1" role="dialog" aria-modal="true" aria-describedby="modal-caption" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-body">
              <div class="instagram-modal__image-container">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="modal-close-button">
                  <span aria-hidden="true">&times;</span>
                </button>
                <img class="instagram-modal__image" src="" alt="Instagram post" id="modal-image">
              </div>
              <div class="instagram-modal__content">
                <div class="instagram-modal__meta">
                  <span class="instagram-modal__stat">
                    <i class="far fa-heart instagram-modal__icon"></i>
                    <span id="modal-likes">0</span>
                  </span>
                  <span class="instagram-modal__stat">
                    <i class="far fa-comment instagram-modal__icon instagram-modal__icon--comment"></i>
                    <span id="modal-comments">0</span>
                  </span>
                  <span class="instagram-modal__date" id="modal-date"></span>
                </div>
                <p class="instagram-modal__caption" id="modal-caption"></p>
              </div>
            </div>
            <div class="instagram-modal__footer">
              <a href="#" target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="modal-instagram-link">
                <i class="fab fa-instagram"></i>
                View on Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    this.attachEventListeners();
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
        <div class="instagram-card" role="button" tabindex="0" data-post-id="${this.escapeHtml(item.id)}">
          <div class="instagram-card__media" style="background-image: url('${imageUrl}')">
            <img src="${imageUrl}" alt="${this.escapeHtml(title)}" />
          </div>
          <div class="instagram-card__header">
            <div class="instagram-card__engagement">
              <span class="instagram-card__stat">
                <i class="far fa-heart instagram-card__icon"></i>
                ${likes > 0 ? `<span class="instagram-card__count">${likes}</span>` : ""}
              </span>
              <span class="instagram-card__stat">
                <i class="far fa-comment instagram-card__icon instagram-card__icon--comment"></i>
                ${comments > 0 ? `<span class="instagram-card__count">${comments}</span>` : ""}
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

  // Attach event listeners for interactive elements
  attachEventListeners() {
    // Store reference to triggering element for focus return
    this.lastFocusedElement = null;

    // Event delegation for card clicks
    this.container.addEventListener("click", (e) => {
      const card = e.target.closest(".instagram-card");
      if (card) {
        this.lastFocusedElement = card;
        const postId = card.getAttribute("data-post-id");
        if (postId) {
          this.showPostModal(postId);
        }
      }
    });

    // Keyboard accessibility for cards
    this.container.addEventListener("keydown", (e) => {
      const card = e.target.closest(".instagram-card");
      if (card && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        this.lastFocusedElement = card;
        const postId = card.getAttribute("data-post-id");
        if (postId) {
          this.showPostModal(postId);
        }
      }
    });

    // Focus trap for modal
    const modal = document.getElementById("instagram-modal");
    if (modal) {
      modal.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;

        const focusableElements = modal.querySelectorAll(
          "button:not([disabled]), a[href]:not([disabled])",
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      });

      // Return focus when modal closes
      $(modal).on("hidden.bs.modal", () => {
        if (this.lastFocusedElement) {
          this.lastFocusedElement.focus();
          this.lastFocusedElement = null;
        }
      });
    }
  }

  // Show modal with post details
  showPostModal(postId) {
    // Find the post data
    const post = this.feedData.find((item) => item.id === postId);
    if (!post) {
      console.error("Instagram Feed: Post not found", postId);
      return;
    }

    // Get modal elements
    const modal = document.getElementById("instagram-modal");
    const modalTitle = document.getElementById("instagram-modal-title");
    const modalImage = document.getElementById("modal-image");
    const modalImageContainer = modal.querySelector(
      ".instagram-modal__image-container",
    );
    const modalLikes = document.getElementById("modal-likes");
    const modalComments = document.getElementById("modal-comments");
    const modalDate = document.getElementById("modal-date");
    const modalCaption = document.getElementById("modal-caption");
    const modalLink = document.getElementById("modal-instagram-link");

    if (!modal) return;

    // Populate modal with post data
    const title = this.extractTitle(post.caption);
    const imageUrl =
      post.media_type === "VIDEO" && post.thumbnail_url
        ? post.thumbnail_url
        : post.media_url;

    if (modalTitle) modalTitle.textContent = title;
    modalImage.src = imageUrl;
    modalImage.alt = title;
    // Set background image for blurred effect
    if (modalImageContainer) {
      modalImageContainer.style.backgroundImage = `url(${imageUrl})`;
    }
    modalLikes.textContent = post.like_count || 0;
    modalLikes.style.display = (post.like_count || 0) > 0 ? "" : "none";
    modalComments.textContent = post.comments_count || 0;
    modalComments.style.display = (post.comments_count || 0) > 0 ? "" : "none";
    modalDate.textContent = this.formatDate(post.timestamp);
    modalCaption.innerHTML = this.convertTextToLinks(post.caption || "");
    modalLink.href = post.permalink;

    // Show modal using Bootstrap's jQuery plugin
    if (typeof $ !== "undefined" && $.fn.modal) {
      $(modal).modal("show");

      // Set initial focus to close button when modal is shown
      $(modal).on("shown.bs.modal", () => {
        const closeButton = document.getElementById("modal-close-button");
        if (closeButton) {
          closeButton.focus();
        }
      });
    }
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
