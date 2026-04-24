import { describe, expect, test } from "bun:test";
import { collectLocalImagePaths, extractSummary, parsePostFile } from "./blog-content";

describe("parsePostFile", () => {
  test("published true の記事だけを frontmatter から判定できる", () => {
    const parsed = parsePostFile(
      "posts/why-typescript-satisfies-operator.md",
      `---
title: "TypeScript の satisfies 演算子は何に役立つのか"
description: ""
category: "Technology"
published: true
date: "2023-07-01T16:38:44.902+09:00"
---

# heading
`
    );

    expect(parsed.slug).toBe("why-typescript-satisfies-operator");
    expect(parsed.meta.title).toBe("TypeScript の satisfies 演算子は何に役立つのか");
    expect(parsed.meta.category).toBe("Technology");
    expect(parsed.meta.published).toBe(true);
    expect(parsed.body).toBe("# heading");
  });

  test("published false の記事も正しく判定できる", () => {
    const parsed = parsePostFile(
      "posts/00example.md",
      `---
title: "Blog post example"
description: ""
category: "Random"
published: false
date: "2030-01-01T00:00:00.000+09:00"
---

body
`
    );

    expect(parsed.meta.published).toBe(false);
  });
});

describe("collectLocalImagePaths", () => {
  test("ローカル画像だけを抽出し、外部画像は無視する", () => {
    const paths = collectLocalImagePaths(`
![icon](/images/icon.obake.webp)
![remote](//images.ctfassets.net/example.png)
![with-query](/images/photo.webp?fm=webp)
`);

    expect(paths).toEqual(["/images/icon.obake.webp", "/images/photo.webp"]);
  });
});

describe("extractSummary", () => {
  test("リンクはURLではなく本文テキストを要約に残す", () => {
    const summary = extractSummary(
      `[TypeScript 4.9 で導入された](https://example.com) \`satisfies\` 演算子です。`,
      "fallback"
    );

    expect(summary).toBe("TypeScript 4.9 で導入された satisfies 演算子です。");
  });

  test("裸のURLに含まれるアンダースコアを残す", () => {
    const summary = extractSummary("https://atcoder.jp/contests/abc021/tasks/abc021_d", "fallback");

    expect(summary).toBe("https://atcoder.jp/contests/abc021/tasks/abc021_d");
  });
});
