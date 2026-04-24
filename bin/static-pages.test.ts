import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

const rootDir = join(import.meta.dir, "..");

function readProjectFile(path: string): string {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("static page accessibility", () => {
  test("トップページは本文へ移動できるスキップリンクを持つ", () => {
    const html = readProjectFile("static/index.html");

    expect(html).toContain('href="#main-content"');
    expect(html).toContain('id="main-content"');
  });

  test("新規タブで開く外部リンクは opener を共有しない", () => {
    const html = readProjectFile("static/index.html");
    const externalLinkPattern = /<a\b(?=[^>]*\btarget="_blank")[^>]*>/g;
    const externalLinks = html.match(externalLinkPattern) ?? [];

    expect(externalLinks.length).toBeGreaterThan(0);
    expect(externalLinks.every((link) => /\brel="[^"]*\bnoopener\b[^"]*\bnoreferrer\b[^"]*"/.test(link))).toBe(true);
  });
});

describe("shared accessibility styles", () => {
  test("強制色モードでもフォーカス輪郭を保つ", () => {
    const css = readProjectFile("src/styles/site-shell.css");

    expect(css).toContain("@media (forced-colors: active)");
    expect(css).toContain("CanvasText");
  });
});
