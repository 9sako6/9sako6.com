import { BookmarkIcon } from "@/components/icons/BookmarkIcon";
import Link from "next/link";

type Props = {
  url: string;
};

export const BookmarkButton = ({ url }: Props) => {
  return (
    <Link href={url}>
      <a className="hover:text-teal-600 dark:hover:text-teal-400">
        <BookmarkIcon />
      </a>
    </Link>
  );
};