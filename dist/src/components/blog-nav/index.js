import shared from "../../styles/component-shared.css" with { type: "css" };
import styles from "./style.css" with { type: "css" };

const template = document.createElement("template");
template.innerHTML = `
  <nav aria-label="ブログ">
    <slot></slot>
  </nav>
`;

export class BlogNav extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [shared, styles];
    shadow.append(template.content.cloneNode(true));
  }
}

customElements.define("blog-nav", BlogNav);
