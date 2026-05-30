import { existsSync, watch } from "node:fs";
import { resolve } from "node:path";
import { resolveContentDir, resolveOutputDir } from "./build-config";
import { createBuildQueue } from "./dev-build-queue";

const rootDir = resolve(process.cwd());
const contentDir = resolveContentDir(rootDir);
const outputDir = resolveOutputDir(rootDir);
const buildEnv = {
  ...process.env,
  BLOG_INCLUDE_DRAFTS: "true",
  BLOG_ALLOW_MISSING_IMAGES: "true",
  BLOG_OUTPUT_DIR: outputDir
};

function run(command: string[], env: NodeJS.ProcessEnv): Promise<void> {
  const child = Bun.spawn(command, {
    cwd: rootDir,
    env,
    stdout: "inherit",
    stderr: "inherit"
  });

  return child.exited.then((code) => {
    if (code !== 0) {
      throw new Error(`${command.join(" ")} exited with ${code}`);
    }
  });
}

async function build() {
  await run(["bun", "run", "generate"], buildEnv);
}

function startServer() {
  return Bun.spawn(["bun", "run", "dev"], {
    cwd: rootDir,
    env: {
      ...process.env,
      BLOG_ROOT_DIR: outputDir
    },
    stdout: "inherit",
    stderr: "inherit"
  });
}

if (!existsSync(contentDir)) {
  console.error(`Missing content directory: ${contentDir}`);
  process.exit(1);
}

console.log(`Watching ${contentDir}`);
await build();

const server = startServer();
const buildQueue = createBuildQueue(build);

function shutdown(code: number) {
  server.kill();
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

watch(contentDir, { recursive: true }, async () => {
  try {
    await buildQueue.requestBuild();
  } catch (error) {
    console.error(error);
    shutdown(1);
  }
});

const serverExitCode = await server.exited;
process.exit(serverExitCode);
