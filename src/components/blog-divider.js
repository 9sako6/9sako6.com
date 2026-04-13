const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      margin-top: 4rem;
    }

    hr {
      width: 9rem;
      margin: 0;
      border: 0;
      border-top: 1px solid var(--line, #3a3530);
    }
  </style>
  <hr />
`;

export class BlogDivider extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(template.content.cloneNode(true));
  }
}

customElements.define("blog-divider", BlogDivider);
