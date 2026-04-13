import styles from "./style.css" with { type: "css" };

function escapeText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export class BlogPostsSection extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const heading = this.getAttribute("heading") ?? "";
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [styles];

    shadow.innerHTML = `
      <h2>${escapeText(heading)}</h2>
      <div class="list">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("blog-posts-section", BlogPostsSection);
