function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export class BlogPostEntry extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const href = this.getAttribute("href") ?? "/";
    const title = this.getAttribute("title") ?? "";
    const summary = this.getAttribute("summary") ?? "";
    const date = this.getAttribute("date");
    const shadow = this.attachShadow({ mode: "open" });

    const container = document.createElement("article");
    container.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 0.95rem 0;
          border-bottom: 1px solid var(--line, #302d28);
        }

        a {
          color: #cbc3b7;
          font-size: 1.08rem;
          text-decoration: none;
        }

        a:hover {
          color: #d8d0c2;
        }

        a:focus-visible {
          outline: 3px solid var(--focus, #cab27a);
          outline-offset: 3px;
        }

        p {
          margin: 0.8rem 0 0;
          max-width: 34rem;
          color: var(--muted, #aaa294);
          overflow-wrap: anywhere;
        }

        time {
          display: block;
          margin-top: 0.7rem;
          color: var(--muted, #aaa294);
        }

        @media (max-width: 640px) {
          a {
            font-size: 1rem;
          }
        }
      </style>
      <a href="${escapeAttribute(href)}">${escapeAttribute(title)}</a>
      ${date ? `<time datetime="${escapeAttribute(date)}"></time>` : ""}
      <p>${escapeAttribute(summary)}</p>
    `;

    const time = container.querySelector("time");
    if (time && date) {
      time.textContent = new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "long",
        timeZone: "Asia/Tokyo"
      }).format(new Date(date));
    }

    shadow.append(container);
  }
}

customElements.define("blog-post-entry", BlogPostEntry);
