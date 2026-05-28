import { describe, expect, test } from "bun:test";
import { resolveContentDir, resolveOutputDir, resolveServeDir } from "./build-config";

describe("build path config", () => {
  test("既定では既存の content/blog と dist を使う", () => {
    expect(resolveContentDir("/repo", {})).toBe("/repo/content/blog");
    expect(resolveOutputDir("/repo", {})).toBe("/repo/dist");
    expect(resolveServeDir("/repo", {})).toBe("/repo/dist");
  });

  test("外部 content と出力先を環境変数で指定できる", () => {
    expect(resolveContentDir("/repo", { BLOG_CONTENT_DIR: "/blog/contents" })).toBe("/blog/contents");
    expect(resolveOutputDir("/repo", { BLOG_OUTPUT_DIR: "/blog/dist" })).toBe("/blog/dist");
    expect(resolveServeDir("/repo", { BLOG_ROOT_DIR: "/blog/.dev-dist" })).toBe("/blog/.dev-dist");
  });
});
