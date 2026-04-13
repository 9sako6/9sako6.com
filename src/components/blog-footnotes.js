const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      margin-top: 3rem;
      color: var(--muted, #aaa294);
      font-size: 0.9em;
    }
  </style>
  <slot></slot>
`;

export class BlogFootnotes extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(template.content.cloneNode(true));
  }
}

customElements.define("blog-footnotes", BlogFootnotes);
