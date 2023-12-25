import Link from "next/link";
import styles from "./Card.module.scss";
import { Tag } from "./Tag";

type Props = {
  slug: string;
  title: string;
  imageUrl?: string;
  tags: string[];
};

export const Card: React.FC<Props> = ({
  slug,
  title,
  imageUrl,
  tags,
}: Props) => {
  const postPath = `/posts/${slug}`;

  return (
    <div className="pb-4 text-left w-full md:grid md:grid-cols-8 md:gap-8">
      <div className="md:col-span-6">
        <div className="pb-3">
          <Link
            href={postPath}
            className="text-2xl hover:underline cursor-pointer dark:text-zinc-300"
            aria-label="link to the post"
          >
            {title}
          </Link>
        </div>
        <div>
          <span className="pb-4">
            {tags.map((tag) => (
              <Tag tag={tag} className="mr-4" key={tag} />
            ))}
          </span>
        </div>
      </div>
      <div className={styles.imageContainer}>
        <Link
          href={postPath}
          className="hover:underline font-mono hidden md:block"
          aria-label={title}
        >
          <div>Read more →</div>
        </Link>
      </div>
    </div>
  );
};
