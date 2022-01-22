import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { client } from "../lib/client";
import {
  EnumPostsQuery,
  EnumPostsDocument,
} from "../graphql/queries/enumPosts.generated";
import styles from "../styles/Home.module.css";
import type { Post } from "../types";
import type { GetStaticProps } from "next";
import { PostCard } from "../components/atoms";

type Props = {
  posts: Post[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const result = await client.query<EnumPostsQuery>({
    query: EnumPostsDocument,
  });

  if (result.loading || !result?.data?.blogPostCollection?.items) {
    return {
      props: { posts: [] as Post[] },
    };
  }
  const posts: Post[] = result.data.blogPostCollection.items.filter(
    (post): post is Post => post !== null && post !== undefined
  );

  return {
    props: { posts },
  };
};

const Home: NextPage<Props> = ({ posts }) => {
  return (
    <div>
      <Head>
        <title>腐ったコロッケ</title>
        <meta
          name="description"
          content="Webアプリケーション開発を専門とするエンジニアの技術ブログ"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {posts.map((post) => (
        <PostCard
          key={post.sys.id}
          slug={post.slug || ""}
          title={post.title || ""}
          description={post.description || ""}
          createdAt={post.sys.firstPublishedAt}
          imageUrl={post.eyeCatchImage?.url || undefined}
        />
      ))}
    </div>
  );
};

export default Home;
