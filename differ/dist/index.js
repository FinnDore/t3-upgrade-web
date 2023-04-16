"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fileUtils_1 = require("./lib/fileUtils");
const generateDiff_1 = require("./lib/generateDiff");
void (async () => {
    const versions = await (0, fileUtils_1.getMissingDiffs)(200);
    console.log(`generating ${versions.length} missing diffs `);
    const res = await Promise.all(versions.map((version) => (0, generateDiff_1.generateDiff)({ ...version })));
    console.log(res);
})();
//# sourceMappingURL=index.js.map