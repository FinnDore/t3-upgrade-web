import { getMissingDiffs } from "./lib/fileUtils";
import { generateDiff } from "./lib/generateDiff";
void (async () => {
  const versions = await getMissingDiffs(200);
  console.log(`generating ${versions.length} missing diffs `);
  for (const version of versions) {
    console.log("Generating diff for", version);
    await generateDiff({
      ...version,
    });
  }
  //   console.log(missingDiffs);
})();
