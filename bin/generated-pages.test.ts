import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";

const rootDir = join(import.meta.dir, "..");
const fixtureContentDir = join(rootDir, "bin", "fixtures", "blog-content");
const generatedDistDir = join(tmpdir(), `9sako6-generated-pages-test-${Date.now()}`);

function readGeneratedFile(path: string): string {
  return readFileSync(join(generatedDistDir, path), "utf8");
}

beforeAll(async () => {
  const proc = Bun.spawn(["bun", "run", "generate"], {
    cwd: rootDir,
    env: {
      ...process.env,
      BLOG_CONTENT_DIR: fixtureContentDir,
      BLOG_OUTPUT_DIR: generatedDistDir
    },
    stdout: "inherit",
    stderr: "inherit"
  });

  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`bun run generate exited with ${code}`);
  }
});

afterAll(() => {
  rmSync(generatedDistDir, { recursive: true, force: true });
});

describe("generated pages", () => {
  test("記事詳細ページのキャラクター切り替えは装飾として扱う", () => {
    const html = readGeneratedFile("posts/yukicoder909/index.html");

    expect(html).toContain('class="post-reader"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('src="/assets/reader-ghost.png"');
    expect(html).toContain('src="/assets/chef-ghost.png"');
    expect(html).toContain('alt=""');
  });

  test("ブログのPC版横幅はトップページと同じ広さにする", () => {
    const html = readGeneratedFile("posts/index.html");
    const css = readFileSync(join(rootDir, "src", "styles", "blog.css"), "utf8");

    expect(html).toContain('<main id="main-content" class="blog-main">');
    expect(css).toContain(".blog-main");
    expect(css).toContain("width: min(100%, 68rem);");
  });

  test("固定ページのCSS参照は生成後にバージョン付きURLになる", () => {
    const html = readGeneratedFile("index.html");

    expect(html).toMatch(/href="\/src\/styles\/site-shell\.css\?v=[a-f0-9]{12}"/);
    expect(html).not.toContain('href="/src/styles/site-shell.css"');
  });

  test("固定ページ用の画像アセットも生成先に含める", () => {
    const asset = readFileSync(join(generatedDistDir, "assets", "ghost-01.png"));
    const readerAsset = readFileSync(join(generatedDistDir, "assets", "reader-ghost.png"));
    const chefAsset = readFileSync(join(generatedDistDir, "assets", "chef-ghost.png"));

    expect(asset.byteLength).toBeGreaterThan(10_000);
    expect(readerAsset.byteLength).toBeGreaterThan(10_000);
    expect(chefAsset.byteLength).toBeGreaterThan(10_000);
  });

  test("公開記事は GFM の Markdown 表現を持つ", () => {
    const markdownPath = join(generatedDistDir, "posts", "why-not-how", "index.md");

    expect(existsSync(markdownPath)).toBe(true);

    const markdown = readFileSync(markdownPath, "utf8");

    expect(markdown).toContain('# なぜ "How" の記事を書きたくないか');
    expect(markdown).toContain("> [!NOTE]\n> 世の中にある \"How\" の記事を批判するつもりは毛頭ありません。");
    expect(markdown).not.toContain("---\n");
    expect(markdown).not.toContain(":::message");
  });

  test("記事 HTML は Markdown 表現を alternate として示す", () => {
    const html = readGeneratedFile("posts/why-not-how/index.html");

    expect(html).toContain('<link rel="alternate" type="text/markdown" href="/posts/why-not-how/index.md" />');
  });

  test("GFM Alert は記事 HTML では既存の message 表示になる", () => {
    const html = readGeneratedFile("posts/why-not-how/index.html");

    expect(html).toContain('<aside class="message">');
    expect(html).toContain("世の中にある &quot;How&quot; の記事を批判するつもりは毛頭ありません。");
    expect(html).not.toContain("[!NOTE]");
  });

  test("Markdown 表現は GFM variant の Content-Type を宣言する", () => {
    const headers = readGeneratedFile("_headers");

    expect(headers).toContain("/posts/*/index.md");
    expect(headers).toContain("Content-Type: text/markdown; charset=utf-8; variant=GFM");
  });
});
