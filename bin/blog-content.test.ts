import { describe, expect, test } from "bun:test";
import { collectLocalImagePaths, extractSummary, parsePostFile, shouldIncludePost } from "./blog-content";

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
<img src="/images/gallery/item.jpeg" alt="">
<img src="https://example.com/remote.jpeg" alt="">
`);

    expect(paths).toEqual(["/images/icon.obake.webp", "/images/photo.webp", "/images/gallery/item.jpeg"]);
  });
});

describe("shouldIncludePost", () => {
  test("通常ビルドでは公開記事だけを含める", () => {
    expect(shouldIncludePost({ published: true })).toBe(true);
    expect(shouldIncludePost({ published: false })).toBe(false);
  });

  test("ローカルプレビューでは未公開記事も含める", () => {
    expect(shouldIncludePost({ published: false }, { includeDrafts: true })).toBe(true);
  });

  test("ローカルプレビューでは日付が壊れた未公開記事を除外する", () => {
    expect(shouldIncludePost({ published: false, date: "2023-08-10T23:50:37.0${millisecond}+09:00" }, { includeDrafts: true })).toBe(false);
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
