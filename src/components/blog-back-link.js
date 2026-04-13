const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      margin-top: 6rem;
      font-size: 0.9em;
    }

    a {
      color: var(--muted, #aaa294);
      text-decoration-thickness: 0.06em;
      text-underline-offset: 0.18em;
    }

    a:hover {
      color: var(--link, #e5ded1);
    }

    a:focus-visible {
      outline: 3px solid var(--focus, #cab27a);
      outline-offset: 3px;
    }
  </style>
  <nav>
    <a><slot></slot></a>
  </nav>
`;

export class BlogBackLink extends HTMLElement {
  static get observedAttributes() {
    return ["href"];
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: "open" });
      shadow.append(template.content.cloneNode(true));
    }
    this.#sync();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.#sync();
    }
  }

  #sync() {
    const anchor = this.shadowRoot.querySelector("a");
    anchor.setAttribute("href", this.getAttribute("href") ?? "#");
  }
}

customElements.define("blog-back-link", BlogBackLink);
