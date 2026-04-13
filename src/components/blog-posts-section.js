export class BlogPostsSection extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const heading = this.getAttribute("heading") ?? "";
    const shadow = this.attachShadow({ mode: "open" });

    const section = document.createElement("section");
    section.innerHTML = `
      <style>
        :host {
          display: block;
        }

        :host(:not(:first-of-type)) {
          margin-top: 3.25rem;
        }

        h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          line-height: 1.35;
        }

        .list {
          margin-top: 1rem;
          border-top: 1px solid var(--line, #302d28);
        }

        ::slotted(blog-post-entry) {
          display: block;
        }
      </style>
      <h2>${heading.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")}</h2>
      <div class="list">
        <slot></slot>
      </div>
    `;

    shadow.append(section);
  }
}

customElements.define("blog-posts-section", BlogPostsSection);
