import Link from "next/link";

type Props = {
  date: Date;
};

export const PostDate = ({ date }: Props): JSX.Element => {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return (
    <time className="text-slate-400 dark:text-zinc-500">
      <Link href={`/archives/${year}`} passHref>
        <a className="hover:underline">{year}年</a>
      </Link>
      {month}月{day}日 {hours}:{minutes}
    </time>
  );
};
