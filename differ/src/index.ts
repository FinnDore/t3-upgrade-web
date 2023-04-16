import { getMissingDiffs } from "./lib/fileUtils";
import { generateDiff } from "./lib/generateDiff";
void (async () => {
  const versions = await getMissingDiffs(200);
  console.log(`generating ${versions.length} missing diffs `);
  const res = await Promise.all(
    versions.map((version) => generateDiff({ ...version }))
  );
  console.log(res);
})();
