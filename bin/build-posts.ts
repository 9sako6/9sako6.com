import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { collectLocalImagePaths, extractSummary, parsePostFile } from "./blog-content";

const footnoteState = {
  defs: new Map<string, string>(),
  refs: [] as string[],
  depth: 0
};

marked.use({
  hooks: {
    preprocess(markdown: string) {
      footnoteState.depth++;
      if (footnoteState.depth !== 1) {
        return markdown;
      }

      footnoteState.defs.clear();
      footnoteState.refs.length = 0;

      return markdown.replace(
        /^\[\^([^\]\n]+)\]:[ \t]*([^\n]*(?:\n[ \t]+[^\n]*)*)/gm,
        (_match, label: string, content: string) => {
          footnoteState.defs.set(label, content.replace(/\n[ \t]+/g, "\n").trim());
          return "";
        }
      );
    },
    postprocess(html: string) {
      footnoteState.depth--;
      if (footnoteState.depth !== 0 || footnoteState.refs.length === 0) {
        return html;
      }

      const items = footnoteState.refs
        .map((label) => {
          const content = footnoteState.defs.get(label) ?? "";
          const rendered = marked.parseInline(content);
          return `<li id="footnote-${label}">${rendered} <a href="#footnote-ref-${label}" data-footnote-backref aria-label="Back to reference ${label}">↩</a></li>`;
        })
        .join("\n");

      return `${html}\n<blog-footnotes>\n<h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n${items}\n</ol>\n</blog-footnotes>\n`;
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
        return `<blog-message>${this.parser.parse(token.tokens!)}</blog-message>`;
      }
    }
  ]
});

type PublishedPost = ReturnType<typeof parsePostFile> & {
  summary: string;
  localImages: string[];
};

type CategorySection = {
  id: string;
  key: string;
  title: string;
  posts: PublishedPost[];
};

const rootDir = fileURLToPath(new URL("../", import.meta.url));
const contentDir = join(rootDir, "content", "blog");
const sourcePostsDir = join(contentDir, "posts");
const sourceImagesDir = join(contentDir, "public", "images");
const outputPostsDir = join(rootDir, "posts");
const outputImagesDir = join(rootDir, "images");
const redirectsPath = join(rootDir, "_redirects");
const categoryOrder = ["Technology", "Competitive Programming", "Random"] as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function readPublishedPosts(): PublishedPost[] {
  const entries = readdirSync(sourcePostsDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const path = join(sourcePostsDir, name);
      const raw = readFileSync(path, "utf8");
      const parsed = parsePostFile(path, raw);

      return {
        ...parsed,
        summary: extractSummary(parsed.body, parsed.meta.title),
        localImages: collectLocalImagePaths(parsed.body)
      };
    })
    .filter((post) => post.meta.published)
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

  return categoryOrder
    .map((key) => ({
      id: key.toLowerCase().replaceAll(" ", "-"),
      key,
      title: key,
      posts: grouped.get(key) ?? []
    }))
    .filter((section) => section.posts.length > 0);
}

function layout(title: string, description: string, body: string, options?: { includeMath?: boolean }): string {
  const mathHead = options?.includeMath
    ? `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" />
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js"></script>
    <script defer src="/src/components/blog-math.js"></script>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&display=swap" />
    <link rel="stylesheet" href="/src/styles/site-shell.css" />
    <link rel="stylesheet" href="/src/styles/blog.css" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    ${mathHead}
    <script type="module" src="/src/components/index.js"></script>
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
          (post) => `<blog-post-entry
            href="/posts/${post.slug}/"
            title="${escapeHtml(post.meta.title)}"
            date="${escapeHtml(post.meta.date)}"
            summary="${escapeHtml(post.summary)}"
          ></blog-post-entry>`
        )
        .join("\n");

      return `<blog-posts-section heading="${escapeHtml(section.title)}">
        ${items}
      </blog-posts-section>`;
    })
    .join("\n");

  return layout(
    "Posts | 9sako6",
    "公開済みのブログ記事一覧です。",
    `<main>
      <blog-nav></blog-nav>
      <h1 class="sr-only">ブログ記事一覧</h1>
      ${sections}
      <blog-back-link href="/">← トップへ</blog-back-link>
    </main>`
  );
}

function buildPostPage(post: PublishedPost): string {
  const html = marked.parse(post.body, { gfm: true }) as string;

  return layout(
    `${post.meta.title} | 9sako6`,
    post.meta.description || post.summary,
    `<main>
      <blog-nav></blog-nav>
      <article>
        <h1>${escapeHtml(post.meta.title)}</h1>
        <blog-post-meta date="${escapeHtml(post.meta.date)}"></blog-post-meta>
        <div class="content" data-render-math="true">${html}</div>
      </article>
      <blog-divider></blog-divider>
      <blog-back-link href="/posts/">← 記事一覧へ</blog-back-link>
    </main>`
    ,
    { includeMath: true }
  );
}

function cleanOutput() {
  rmSync(outputPostsDir, { recursive: true, force: true });
  rmSync(outputImagesDir, { recursive: true, force: true });
  mkdirSync(outputPostsDir, { recursive: true });
  mkdirSync(outputImagesDir, { recursive: true });
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
    ...postRedirects,
    "",
    "/ /index.html 200",
    "/favicon.ico /favicon.ico 200",
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
  writePosts(posts);
  copyReferencedImages(posts);
  writeRedirects(posts);
}

main();
