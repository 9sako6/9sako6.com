const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      margin-bottom: 2.5rem;
    }

    a {
      color: var(--link, #e5ded1);
      text-decoration-thickness: 0.08em;
      text-underline-offset: 0.18em;
    }

    a:focus-visible {
      outline: 3px solid var(--focus, #cab27a);
      outline-offset: 3px;
    }
  </style>
  <nav aria-label="ブログ">
    <a href="/posts/">Blog</a>
  </nav>
`;

export class BlogNav extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) {
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(template.content.cloneNode(true));
  }
}

customElements.define("blog-nav", BlogNav);
