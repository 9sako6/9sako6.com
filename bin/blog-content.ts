export type PostMeta = {
  title: string;
  description: string;
  category: string;
  published: boolean;
  date: string;
};

type PostPublication = Pick<PostMeta, "published"> & Partial<Pick<PostMeta, "date">>;

export type ParsedPost = {
  slug: string;
  meta: PostMeta;
  body: string;
};

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
const LOCAL_MARKDOWN_IMAGE_RE = /!\[[^\]]*]\((\/images\/[^)\s?]+(?:\?[^)\s]*)?)\)/g;
const LOCAL_HTML_IMAGE_RE = /<img\b[^>]*\bsrc=(["'])(\/images\/[^"'\s?]+(?:\?[^"'\s]*)?)\1[^>]*>/g;

function readFrontmatterValue(frontmatter: string, key: string): string | null {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

function unquote(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

export function parsePostFile(path: string, raw: string): ParsedPost {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error(`Invalid frontmatter: ${path}`);
  }

  const [, frontmatter, body] = match;
  const fileName = path.split("/").pop() ?? path;
  const slug = fileName.replace(/\.md$/, "");

  return {
    slug,
    meta: {
      title: unquote(readFrontmatterValue(frontmatter, "title")),
      description: unquote(readFrontmatterValue(frontmatter, "description")),
      category: unquote(readFrontmatterValue(frontmatter, "category")),
      published: readFrontmatterValue(frontmatter, "published") === "true",
      date: unquote(readFrontmatterValue(frontmatter, "date"))
    },
    body: body.trim()
  };
}

export function shouldIncludePost(post: PostPublication, options: { includeDrafts?: boolean } = {}): boolean {
  if (post.published) {
    return true;
  }

  if (options.includeDrafts !== true) {
    return false;
  }

  return post.date === undefined || Number.isFinite(new Date(post.date).getTime());
}

export function collectLocalImagePaths(markdown: string): string[] {
  const paths = new Set<string>();

  for (const match of markdown.matchAll(LOCAL_MARKDOWN_IMAGE_RE)) {
    const path = match[1]?.split("?")[0];
    if (path) {
      paths.add(path);
    }
  }

  for (const match of markdown.matchAll(LOCAL_HTML_IMAGE_RE)) {
    const path = match[2]?.split("?")[0];
    if (path) {
      paths.add(path);
    }
  }

  return [...paths];
}

export function extractSummary(markdown: string, fallback: string): string {
  const paragraph = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith("#") && !block.startsWith("```"));

  const text = (paragraph ?? fallback)
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text || fallback;
}
