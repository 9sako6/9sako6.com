import { describe, expect, test } from "bun:test";
import { createBuildQueue } from "./dev-build-queue";

describe("createBuildQueue", () => {
  test("build 中に来た変更は捨てず、完了後にもう一度 build する", async () => {
    let releaseFirstBuild!: () => void;
    const builds: Promise<void>[] = [];

    const queue = createBuildQueue(() => {
      const index = builds.length;
      const build =
        index === 0
          ? new Promise<void>((resolve) => {
              releaseFirstBuild = resolve;
            })
          : Promise.resolve();

      builds.push(build);
      return build;
    });

    const firstRun = queue.requestBuild();
    queue.requestBuild();

    expect(builds).toHaveLength(1);

    releaseFirstBuild();
    await firstRun;

    expect(builds).toHaveLength(2);
  });
});
