import type { NextPage } from "next";
import { client } from "../../lib/client";
import { markdownToHtml } from "../../lib/markdown-html";
import {
  EnumPostsQueryVariables,
  EnumPostsQuery,
  EnumPostsDocument,
} from "../../graphql/queries/enumPosts.generated";
import type { Post } from "../../types";
import type { GetStaticPaths, GetStaticProps } from "next";
import { PostPage } from "../../components/templates";
import { useRouter } from "next/router";

type Props = Post & {
  bodyHtml: string;
};

type Params = {
  slug: string;
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const result = await client.query<EnumPostsQuery, EnumPostsQueryVariables>({
    query: EnumPostsDocument,
  });

  if (result.loading || !result.data || !result.data.blogPostCollection) {
    return {
      paths: [],
      fallback: false,
    };
  }
  const posts = result.data.blogPostCollection.items;
  const paths = posts
    .filter((post) => post?.slug)
    .map((post) => ({
      params: { slug: post!.slug! },
    }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  if (!params) return { props: {} as Props };
  // Get a post by slug.
  const result = await client.query<EnumPostsQuery, EnumPostsQueryVariables>({
    query: EnumPostsDocument,
    variables: {
      where: { slug: params.slug },
    },
  });
  const post = result.data.blogPostCollection?.items[0];

  if (!post) {
    return { props: {} as Props };
  }

  const bodyHtml = await markdownToHtml(post.body || "");

  return {
    props: {
      bodyHtml,
      ...post,
    },
  };
};

const Post: NextPage<Props> = (props) => {
  const url = `${process.env.siteUrl}/posts/${props.slug}`;
  return <PostPage {...props} url={url} />;
};

export default Post;
