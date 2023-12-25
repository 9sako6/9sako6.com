import type { Post } from "@/types";
import Head from "next/head";
import { Card } from "../features/post/Card";
import { PageTitle } from "../ui/PageTitle";

type Props = {
  posts: Post[];
  year: string;
};

export const YearlyArchivesPage = ({ posts, year }: Props) => {
  const pageTitle = `${year}年に公開された${posts.length}件の記事`;
  const seoTitle = `${pageTitle} - ${process.env.siteTitle}`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={process.env.siteDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={process.env.siteDescription} />
        <meta
          property="og:image"
          content={`${process.env.siteUrl}/icon.nine.webp`}
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@9sako6" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="l-0">
        <PageTitle title={pageTitle} />
      </div>
      {posts.length === 0 ? (
        <p>There are no posts.</p>
      ) : (
        posts.map((post) => (
          <Card
            key={post.slug}
            slug={post.slug}
            title={post.title}
            imageUrl={post.eyecatch}
            tags={post.topics}
          />
        ))
      )}
    </>
  );
};
