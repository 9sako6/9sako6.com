function renderMath() {
  if (typeof window.renderMathInElement !== "function") {
    return;
  }

  for (const node of document.querySelectorAll("[data-render-math='true']")) {
    window.renderMathInElement(node, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false }
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      throwOnError: false
    });
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", renderMath, { once: true });
} else {
  renderMath();
}
