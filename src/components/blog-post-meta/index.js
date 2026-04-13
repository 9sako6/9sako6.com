import styles from "./style.css" with { type: "css" };

const template = document.createElement("template");
template.innerHTML = `<slot></slot>`;

export class BlogPostMeta extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [styles];
    shadow.append(template.content.cloneNode(true));
  }
}

customElements.define("blog-post-meta", BlogPostMeta);
