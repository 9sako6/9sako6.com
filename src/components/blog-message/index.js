import styles from "./style.css" with { type: "css" };

const template = document.createElement("template");
template.innerHTML = `
  <span class="symbol" aria-hidden="true">!</span>
  <div class="body">
    <slot></slot>
  </div>
`;

export class BlogMessage extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [styles];
    shadow.append(template.content.cloneNode(true));
  }
}

customElements.define("blog-message", BlogMessage);
