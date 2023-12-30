const { readdirSync, readFileSync, writeFileSync } = require("fs");
const matter = require("gray-matter");
const colors = require("colors/safe");

const allTopics = readdirSync("posts").flatMap((fileName) => {
  const file = readFileSync(`posts/${fileName}`, "utf-8");
  const metadata = matter(file).data;

  if (process.env.NODE_ENV === "production" && !metadata.published) {
    return [];
  }

  return metadata.topics;
});

const topics = Array.from(new Set(allTopics)).sort((a, b) =>
  a.localeCompare(b),
);

writeFileSync("./src/data/topics.json", JSON.stringify(topics));

console.log(colors.magenta("info - topics JSON was generated."));
