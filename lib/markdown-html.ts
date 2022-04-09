import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAnchorHeading from "./rehypeAnchorHeading";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";

export const markdownToHtml = async (markdown: string) => {
  return (
    await unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeAnchorHeading)
      .use(rehypeKatex)
      .use(rehypePrism)
      .use(rehypeStringify)
      .process(markdown)
  ).toString();
};
