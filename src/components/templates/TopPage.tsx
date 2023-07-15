import { getCategorizedPosts } from "@/lib/get-categorized-posts";
import type { Metadata } from "@/types";
import { Card } from "../features/post/Card";

export type Post = Metadata & { slug: string };

type Props = {
  posts: Post[];
};

export const TopPage = ({ posts }: Props): JSX.Element => {
  const categorizedPosts = getCategorizedPosts(posts);

  return (
    <>
      {posts.length === 0 ? (
        <p>There are no posts.</p>
      ) : (
        categorizedPosts.map((categoryAndPosts) => {
          const [category, posts] = categoryAndPosts;

          return (
            <div key={category}>
              <h1
                className="pt-10 pb-10 mb-10 font-mono text-2xl"
                id={category}
              >
                <a href={`#${category}`}>{category}</a>
              </h1>
              {posts.map(
                ({ slug, title, description, date, eyecatch, topics }) => (
                  <Card
                    key={slug}
                    slug={slug || ""}
                    title={title || ""}
                    description={description}
                    createdAt={date}
                    imageUrl={eyecatch}
                    tags={topics}
                  />
                )
              )}
            </div>
          );
        })
      )}
    </>
  );
};