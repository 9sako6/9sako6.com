import styles from "./style.css" with { type: "css" };

export class BlogPostsSection extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [styles];

    shadow.innerHTML = `
      <slot name="heading"></slot>
      <div class="list">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("blog-posts-section", BlogPostsSection);
