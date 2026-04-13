import shared from "../shared.css" with { type: "css" };
import styles from "./style.css" with { type: "css" };

const template = document.createElement("template");
template.innerHTML = `<slot></slot>`;

export class BlogPostEntry extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [shared, styles];
    shadow.append(template.content.cloneNode(true));
  }
}

customElements.define("blog-post-entry", BlogPostEntry);
