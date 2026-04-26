import { join, normalize, resolve } from "node:path";

const rootDir = resolve(process.cwd(), "dist");
const port = Number(process.env.PORT ?? "3000");
const markdownContentType = "text/markdown; charset=utf-8; variant=GFM";

function toFilePath(url: URL): { path: string; redirect?: string } {
  const pathname = decodeURIComponent(url.pathname);
  const normalized = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  let relativePath = normalized.replace(/^[/\\]+/, "");

  if (!relativePath || relativePath.endsWith("/")) {
    relativePath = `${relativePath}index.html`;
  } else if (!relativePath.includes(".")) {
    return {
      path: join(rootDir, relativePath, "index.html"),
      redirect: `${pathname}/`
    };
  }

  return { path: join(rootDir, relativePath) };
}

console.log(`Serving ${rootDir} at http://localhost:${port}`);

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const { path, redirect } = toFilePath(url);
    const file = Bun.file(path);

    if (redirect && (await file.exists())) {
      return Response.redirect(new URL(redirect, request.url), 301);
    }

    if (await file.exists()) {
      const headers = path.endsWith(".md") ? { "Content-Type": markdownContentType } : undefined;
      return new Response(file, { headers });
    }

    const notFoundFile = Bun.file(join(rootDir, "404.html"));
    if (await notFoundFile.exists()) {
      return new Response(notFoundFile, { status: 404 });
    }

    return new Response("Not Found", { status: 404 });
  }
});
