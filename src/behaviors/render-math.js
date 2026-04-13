function renderDisplayMath(container) {
  if (typeof window.katex?.render !== "function") {
    return;
  }

  for (const node of container.querySelectorAll("[data-katex-display]")) {
    const source = node.getAttribute("data-katex-display");
    if (!source) {
      continue;
    }

    window.katex.render(decodeURIComponent(source), node, {
      displayMode: true,
      throwOnError: false
    });
  }
}

function renderInlineMath(container) {
  if (typeof window.renderMathInElement !== "function") {
    return;
  }

  window.renderMathInElement(container, {
    delimiters: [
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false }
    ],
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    ignoredClasses: ["katex"],
    throwOnError: false
  });
}

function renderMath() {
  for (const node of document.querySelectorAll("[data-render-math='true']")) {
    renderDisplayMath(node);
    renderInlineMath(node);
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", renderMath, { once: true });
} else {
  renderMath();
}
