export function createBuildQueue(build: () => Promise<void>) {
  let running = false;
  let dirty = false;
  let currentRun: Promise<void> | null = null;

  async function drain() {
    do {
      dirty = false;
      await build();
    } while (dirty);

    running = false;
    currentRun = null;
  }

  return {
    requestBuild() {
      dirty = true;

      if (!running) {
        running = true;
        currentRun = drain();
      }

      return currentRun!;
    }
  };
}
