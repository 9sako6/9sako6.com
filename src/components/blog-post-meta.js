const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      margin-top: 0.9rem;
      color: var(--muted, #aaa294);
    }
  </style>
`;

export class BlogPostMeta extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const date = this.getAttribute("date");
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(template.content.cloneNode(true));

    if (!date) {
      return;
    }

    const time = document.createElement("time");
    time.dateTime = date;
    time.textContent = new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "long",
      timeZone: "Asia/Tokyo"
    }).format(new Date(date));

    shadow.append(time);
  }
}

customElements.define("blog-post-meta", BlogPostMeta);
