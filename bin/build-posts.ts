import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { collectLocalImagePaths, extractSummary, parsePostFile } from "./blog-content";
import { formatPostDate } from "./format-date";

const footnoteState = {
  defs: new Map<string, string>(),
  refs: [] as string[],
  depth: 0
};

const mathBlockState = {
  blocks: [] as string[]
};

const siteUrl = "https://9sako6.com";

function protectMathBlocks(markdown: string): string {
  const replaceBlock = (source: string, pattern: RegExp) =>
    source.replace(pattern, (_match: string, leading: string, content: string) => {
      const index = mathBlockState.blocks.push(content.trim()) - 1;
      return `${leading}<div data-katex-block="${index}"></div>\n`;
    });

  return replaceBlock(
    replaceBlock(markdown, /(^|\n)\$\$([\s\S]*?)\$\$(?=\n|$)/g),
    /(^|\n)\\\[([\s\S]*?)\\\](?=\n|$)/g
  );
}

function restoreMathBlocks(html: string): string {
  return html.replace(/<div data-katex-block="(\d+)"><\/div>/g, (_match, index: string) => {
    const source = mathBlockState.blocks[Number(index)] ?? "";
    return `<div data-katex-display="${escapeHtml(encodeURIComponent(source))}"></div>`;
  });
}

marked.use({
  renderer: {
    image(token) {
      const href = token.href?.split("?")[0] ?? "";
      const dimensions = currentImageDimensions[href];
      const title = token.title ? ` title="${escapeHtml(token.title)}"` : "";
      const width = dimensions ? ` width="${dimensions.width}"` : "";
      const height = dimensions ? ` height="${dimensions.height}"` : "";

      return `<img src="${escapeHtml(token.href ?? "")}" alt="${escapeHtml(token.text)}"${title}${width}${height} />`;
    }
  },
  hooks: {
    preprocess(markdown: string) {
      footnoteState.depth++;
      if (footnoteState.depth !== 1) {
        return markdown;
      }

      footnoteState.defs.clear();
      footnoteState.refs.length = 0;
      mathBlockState.blocks.length = 0;

      const withoutFootnotes = markdown.replace(
        /^\[\^([^\]\n]+)\]:[ \t]*([^\n]*(?:\n[ \t]+[^\n]*)*)/gm,
        (_match, label: string, content: string) => {
          footnoteState.defs.set(label, content.replace(/\n[ \t]+/g, "\n").trim());
          return "";
        }
      );

      return protectMathBlocks(withoutFootnotes);
    },
    postprocess(html: string) {
      footnoteState.depth--;
      if (footnoteState.depth !== 0) {
        return html;
      }

      const htmlWithMath = restoreMathBlocks(html);

      if (footnoteState.refs.length === 0) {
        return htmlWithMath;
      }

      const items = footnoteState.refs
        .map((label) => {
          const content = footnoteState.defs.get(label) ?? "";
          const rendered = marked.parseInline(content);
          return `<li id="footnote-${label}">${rendered} <a href="#footnote-ref-${label}" data-footnote-backref aria-label="Back to reference ${label}">↩</a></li>`;
        })
        .join("\n");

      return `${htmlWithMath}\n<section class="footnotes" aria-labelledby="footnote-label">\n<h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n${items}\n</ol>\n</section>\n`;
    }
  },
  extensions: [
    {
      name: "footnoteRef",
      level: "inline",
      start(src: string) {
        return src.match(/\[\^/)?.index;
      },
      tokenizer(src: string) {
        const match = /^\[\^([^\]\n]+)\]/.exec(src);
        if (match) {
          const label = match[1];
          if (!footnoteState.refs.includes(label)) {
            footnoteState.refs.push(label);
          }
          return {
            type: "footnoteRef",
            raw: match[0],
            label
          };
        }
      },
      renderer(token) {
        const label = (token as { label: string }).label;
        return `<sup><a id="footnote-ref-${label}" href="#footnote-${label}" data-footnote-ref aria-describedby="footnote-label">[${label}]</a></sup>`;
      }
    },
    {
      name: "message",
      level: "block",
      start(src: string) {
        return src.match(/^:::message/m)?.index;
      },
      tokenizer(src: string) {
        const match = src.match(/^:::message\n([\s\S]*?)\n:::/);
        if (match) {
          const token = {
            type: "message",
            raw: match[0],
            text: match[1].trim(),
            tokens: [] as marked.Token[]
          };
          this.lexer.blockTokens(token.text, token.tokens);
          return token;
        }
      },
      renderer(token) {
        return `<aside class="message">${this.parser.parse(token.tokens!)}</aside>`;
      }
    }
  ]
});

type PublishedPost = ReturnType<typeof parsePostFile> & {
  summary: string;
  localImages: string[];
  imageDimensions: Record<string, ImageDimensions>;
};

type CategorySection = {
  id: string;
  key: string;
  title: string;
  posts: PublishedPost[];
};

type ImageDimensions = {
  width: number;
  height: number;
};

const rootDir = fileURLToPath(new URL("../", import.meta.url));
const contentDir = join(rootDir, "content", "blog");
const staticDir = join(rootDir, "static");
const sourcePostsDir = join(contentDir, "posts");
const sourceImagesDir = join(contentDir, "public", "images");
const outputDir = join(rootDir, "dist");
const outputPostsDir = join(outputDir, "posts");
const outputImagesDir = join(outputDir, "images");
const redirectsPath = join(outputDir, "_redirects");
const staticEntries = ["404.html", "about", "favicon.ico", "index.html"] as const;
const categoryOrder = ["Technology", "Competitive Programming", "Random"] as const;
const inlineSiteShellCss = readFileSync(join(rootDir, "src", "styles", "site-shell.css"), "utf8");
const inlineBlogCss = readFileSync(join(rootDir, "src", "styles", "blog.css"), "utf8");
let currentImageDimensions: Record<string, ImageDimensions> = {};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function containsMath(markdown: string): boolean {
  return /(^|\n)\$\$[\s\S]*?\$\$(?=\n|$)|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$(?!\s)[^$\n]+?(?<!\s)\$/m.test(markdown);
}

function readPngDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function readJpegDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;

    if (marker === 0xd8 || marker === 0xd9) {
      continue;
    }

    const size = buffer.readUInt16BE(offset);
    if (size < 2 || offset + size > buffer.length) {
      break;
    }

    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3)
      };
    }

    offset += size;
  }

  return null;
}

function readWebpDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }

  const chunkType = buffer.toString("ascii", 12, 16);
  if (chunkType === "VP8 ") {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff
    };
  }

  if (chunkType === "VP8L") {
    const b0 = buffer[21];
    const b1 = buffer[22];
    const b2 = buffer[23];
    const b3 = buffer[24];
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6))
    };
  }

  if (chunkType === "VP8X") {
    return {
      width: 1 + buffer[24] + (buffer[25] << 8) + (buffer[26] << 16),
      height: 1 + buffer[27] + (buffer[28] << 8) + (buffer[29] << 16)
    };
  }

  return null;
}

function readImageDimensions(path: string): ImageDimensions | null {
  const buffer = readFileSync(path);
  return readPngDimensions(buffer) ?? readJpegDimensions(buffer) ?? readWebpDimensions(buffer);
}

function collectImageDimensions(paths: string[]): Record<string, ImageDimensions> {
  return Object.fromEntries(
    paths.flatMap((imagePath) => {
      const relativePath = imagePath.replace(/^\/images\//, "");
      const dimensions = readImageDimensions(join(sourceImagesDir, relativePath));
      return dimensions ? [[imagePath, dimensions]] : [];
    })
  );
}

function readPublishedPosts(): PublishedPost[] {
  const entries = readdirSync(sourcePostsDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const path = join(sourcePostsDir, name);
      const raw = readFileSync(path, "utf8");
      return parsePostFile(path, raw);
    })
    .filter((post) => post.meta.published)
    .map((post) => {
      const localImages = collectLocalImagePaths(post.body);

      return {
        ...post,
        summary: extractSummary(post.body, post.meta.title),
        localImages,
        imageDimensions: collectImageDimensions(localImages)
      };
    })
    .sort((left, right) => right.meta.date.localeCompare(left.meta.date));

  return entries;
}

function groupPostsByCategory(posts: PublishedPost[]): CategorySection[] {
  const grouped = new Map<string, PublishedPost[]>();

  for (const post of posts) {
    const category = post.meta.category || "Random";
    const current = grouped.get(category) ?? [];
    current.push(post);
    grouped.set(category, current);
  }

  const extraCategories = [...grouped.keys()]
    .filter((key) => !categoryOrder.includes(key as (typeof categoryOrder)[number]))
    .sort((left, right) => left.localeCompare(right));

  return [...categoryOrder, ...extraCategories]
    .map((key) => ({
      id: key.toLowerCase().replaceAll(" ", "-"),
      key,
      title: key,
      posts: grouped.get(key) ?? []
    }))
    .filter((section) => section.posts.length > 0);
}

function layout(
  title: string,
  description: string,
  body: string,
  options?: { includeMath?: boolean; pathname?: string; ogType?: "website" | "article" }
): string {
  const mathHead = options?.includeMath
    ? `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" />
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js"></script>
    <script defer src="/src/behaviors/render-math.js"></script>`
    : "";
  const canonicalUrl = new URL(options?.pathname ?? "/", siteUrl).toString();
  const ogType = options?.ogType ?? "website";

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:site_name" content="9sako6" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta name="twitter:card" content="summary" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <style>${inlineSiteShellCss}
${inlineBlogCss}</style>
    ${mathHead}
  </head>
  <body>
    ${body}
  </body>
</html>
`;
}

function buildIndexPage(posts: PublishedPost[]): string {
  const sections = groupPostsByCategory(posts)
    .map((section) => {
      const items = section.posts
        .map(
          (post) => `<li class="post-entry">
            <a href="/posts/${post.slug}/">${escapeHtml(post.meta.title)}</a>
            <time datetime="${escapeHtml(post.meta.date)}">${escapeHtml(formatPostDate(post.meta.date))}</time>
            <p>${escapeHtml(post.summary)}</p>
          </li>`
        )
        .join("\n");

      return `<section class="post-index-section" aria-labelledby="category-${escapeHtml(section.id)}">
        <h2 id="category-${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2>
        <ul class="post-list">
          ${items}
        </ul>
      </section>`;
    })
    .join("\n");

  return layout(
    "Posts | 9sako6",
    "公開済みのブログ記事一覧です。",
    `<main>
      <nav class="blog-nav" aria-label="ブログ">
        <a href="/posts/">Blog</a>
      </nav>
      <h1 class="sr-only">ブログ記事一覧</h1>
      ${sections}
      <nav class="back-link">
        <a href="/">← トップへ</a>
      </nav>
    </main>`,
    { pathname: "/posts/", ogType: "website" }
  );
}

function buildPostPage(post: PublishedPost): string {
  currentImageDimensions = post.imageDimensions;
  const html = marked.parse(post.body, { gfm: true }) as string;
  const includeMath = containsMath(post.body);
  currentImageDimensions = {};

  return layout(
    `${post.meta.title} | 9sako6`,
    post.meta.description || post.summary,
    `<main>
      <nav class="blog-nav" aria-label="ブログ">
        <a href="/posts/">Blog</a>
      </nav>
      <article>
        <h1>${escapeHtml(post.meta.title)}</h1>
        <p class="post-meta"><time datetime="${escapeHtml(post.meta.date)}">${escapeHtml(formatPostDate(post.meta.date))}</time></p>
        <div class="content"${includeMath ? ' data-render-math="true"' : ""}>${html}</div>
      </article>
      <hr class="blog-divider" />
      <nav class="back-link">
        <a href="/posts/">← 記事一覧へ</a>
      </nav>
    </main>`,
    { includeMath, pathname: `/posts/${post.slug}/`, ogType: "article" }
  );
}

function cleanOutput() {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  rmSync(outputPostsDir, { recursive: true, force: true });
  rmSync(outputImagesDir, { recursive: true, force: true });
  mkdirSync(outputPostsDir, { recursive: true });
  mkdirSync(outputImagesDir, { recursive: true });
}

function copyStaticEntries() {
  for (const entry of staticEntries) {
    cpSync(join(staticDir, entry), join(outputDir, entry), { recursive: true });
  }

  mkdirSync(join(outputDir, "src", "styles"), { recursive: true });
  mkdirSync(join(outputDir, "src", "behaviors"), { recursive: true });
  cpSync(join(rootDir, "src", "styles", "site-shell.css"), join(outputDir, "src", "styles", "site-shell.css"));
  cpSync(join(rootDir, "src", "styles", "blog.css"), join(outputDir, "src", "styles", "blog.css"));
  cpSync(join(rootDir, "src", "behaviors", "render-math.js"), join(outputDir, "src", "behaviors", "render-math.js"));
}

function copyReferencedImages(posts: PublishedPost[]) {
  const paths = new Set(posts.flatMap((post) => post.localImages));

  for (const imagePath of paths) {
    const relativePath = imagePath.replace(/^\/images\//, "");
    const sourcePath = join(sourceImagesDir, relativePath);
    const targetPath = join(outputImagesDir, relativePath);

    if (!existsSync(sourcePath)) {
      throw new Error(`Missing image: ${sourcePath}`);
    }

    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(sourcePath, targetPath);
  }
}

function writePosts(posts: PublishedPost[]) {
  writeFileSync(join(outputPostsDir, "index.html"), buildIndexPage(posts));

  for (const post of posts) {
    const postDir = join(outputPostsDir, post.slug);
    mkdirSync(postDir, { recursive: true });
    writeFileSync(join(postDir, "index.html"), buildPostPage(post));
  }
}

function writeRedirects(posts: PublishedPost[]) {
  const postRedirects = posts.map((post) => `/posts/${post.slug} /posts/${post.slug}/ 308`);

  const lines = [
    "/posts /posts/ 308",
    "/about /about/ 308",
    ...postRedirects,
    "",
    "/ /index.html 200",
    "/favicon.ico /favicon.ico 200",
    "/about/* /about/:splat 200",
    "/posts/* /posts/:splat 200",
    "/images/* /images/:splat 200",
    "/src/* /src/:splat 200",
    "",
    "/* /404.html 404!"
  ];

  writeFileSync(redirectsPath, lines.join("\n") + "\n");
}

function main() {
  const posts = readPublishedPosts();
  cleanOutput();
  copyStaticEntries();
  writePosts(posts);
  copyReferencedImages(posts);
  writeRedirects(posts);
}

main();
