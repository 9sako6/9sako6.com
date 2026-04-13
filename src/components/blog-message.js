const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: flex;
      gap: 0.7rem;
      margin: 1.75rem 0;
      padding: 1rem 1.1rem;
      background: #2a2519;
      border-radius: 6px;
      line-height: 1.8;
    }

    .symbol {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.4rem;
      height: 1.4rem;
      margin-top: 0.2rem;
      border-radius: 50%;
      background: #b5982a;
      color: #1a1400;
      font-size: 0.85rem;
      font-weight: 700;
      line-height: 1;
    }

    .body {
      min-width: 0;
    }

    .body ::slotted(*:first-child) {
      margin-top: 0;
    }

    .body ::slotted(*:last-child) {
      margin-bottom: 0;
    }
  </style>
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
    shadow.append(template.content.cloneNode(true));
  }
}

customElements.define("blog-message", BlogMessage);
