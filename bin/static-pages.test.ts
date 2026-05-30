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

  test("スキップリンクは通常表示で画面上に出ず、キーボードフォーカス時だけ表示される", () => {
    const css = readProjectFile("src/styles/site-shell.css");

    expect(css).toContain("clip-path: inset(50%)");
    expect(css).toContain("@media (hover: hover) and (pointer: fine)");
    expect(css).toContain(".skip-link:focus-visible");
    expect(css).not.toContain(".skip-link:focus {");
    expect(css).not.toContain("transform: translateY(-150%)");
  });

  test("新規タブで開く外部リンクは opener を共有しない", () => {
    const html = readProjectFile("static/index.html");
    const externalLinkPattern = /<a\b(?=[^>]*\btarget="_blank")[^>]*>/g;
    const externalLinks = html.match(externalLinkPattern) ?? [];

    expect(externalLinks.length).toBeGreaterThan(0);
    expect(externalLinks.every((link) => /\brel="[^"]*\bnoopener\b[^"]*\bnoreferrer\b[^"]*"/.test(link))).toBe(true);
  });

  test("トップページの浮遊キャラクターは装飾として扱う", () => {
    const html = readProjectFile("static/index.html");

    expect(html).toContain('class="float-friend"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('src="/assets/ghost-01.png"');
    expect(html).toContain('src="/assets/ghost-02.png"');
    expect(html).toContain('src="/assets/ghost-03.png"');
    expect(html).toContain('alt=""');
  });

  test("トップページは読み仮名をrubyに集約し、単独の読み仮名を表示しない", () => {
    const html = readProjectFile("static/index.html");

    expect(html).toContain("<ruby>9sako6<rt>くさころ</rt></ruby>");
    expect(html).not.toContain('class="name-reading"');
  });

  test("トップページは初期描画用の暗い背景色をhead内に持つ", () => {
    const html = readProjectFile("static/index.html");

    expect(html).toContain("html{background:#070706");
    expect(html).toContain("body{background:#070706");
  });

  test("iOS Safariで日付を電話番号として自動リンク化しない", () => {
    const html = readProjectFile("static/index.html");

    expect(html).toContain('<meta name="format-detection" content="telephone=no" />');
    expect(html).toContain("2025/06 - 現在");
  });

  test("スマホ表示の経歴ラベルは16px以上を保つ", () => {
    const html = readProjectFile("static/index.html");

    expect(html).toContain(".career h2");
    expect(html).toContain("font-size: 1rem;");
    expect(html).toContain(".period");
  });

});

describe("shared accessibility styles", () => {
  test("強制色モードでもフォーカス輪郭を保つ", () => {
    const css = readProjectFile("src/styles/site-shell.css");

    expect(css).toContain("@media (forced-colors: active)");
    expect(css).toContain("CanvasText");
  });

  test("サイト全体はダークカラースキームを宣言する", () => {
    const css = readProjectFile("src/styles/site-shell.css");

    expect(css).toContain("color-scheme: dark");
  });
});
