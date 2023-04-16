import { getMissingDiffs } from "./lib/fileUtils";
import { generateDiff } from "./lib/generateDiff";
void (async () => {
  const versions = await getMissingDiffs(200);

  for (const version of versions) {
    await generateDiff({
      ...version,
    });
  }
  //   console.log(missingDiffs);
})();
