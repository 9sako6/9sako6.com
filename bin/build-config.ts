import { join, resolve } from "node:path";

export function resolveContentDir(rootDir: string, env: NodeJS.ProcessEnv = process.env): string {
  return resolve(rootDir, env.BLOG_CONTENT_DIR ?? join("content", "blog"));
}

export function resolveOutputDir(rootDir: string, env: NodeJS.ProcessEnv = process.env): string {
  return resolve(rootDir, env.BLOG_OUTPUT_DIR ?? "dist");
}

export function resolveServeDir(rootDir: string, env: NodeJS.ProcessEnv = process.env): string {
  return resolve(rootDir, env.BLOG_ROOT_DIR ?? "dist");
}
