"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMissingDiffs = exports.getExistingDiffsMap = exports.getDiffPath = exports.executeCommand = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
};
exports.executeCommand = executeCommand;
const getDiffPath = ({ currentVersion, upgradeVersion, features, }) => {
    const featuresString = (0, utils_1.getFeaturesString)(features);
    return path_1.default.join(process.cwd(), "diffs", `diff-${currentVersion}-${upgradeVersion}${featuresString ? `-${featuresString}` : ""}.patch`);
};
exports.getDiffPath = getDiffPath;
const getExistingDiffsMap = () => {
    const existingDiffs = fs_1.default.readdirSync(path_1.default.join(process.cwd(), "diffs"));
    const diffsMap = existingDiffs.reduce((acc, diff) => {
        const versionsAndFeatures = (0, utils_1.extractVersionsAndFeatures)(diff);
        if (!versionsAndFeatures) {
            return acc;
        }
        const { currentVersion, upgradeVersion, features } = versionsAndFeatures;
        const featuresString = (0, utils_1.getFeaturesString)(features);
        return {
            ...acc,
            [`${currentVersion}..${upgradeVersion}${featuresString ? `-${featuresString}` : ""}`]: versionsAndFeatures,
        };
    }, {});
    return diffsMap;
};
exports.getExistingDiffsMap = getExistingDiffsMap;
const getMissingDiffs = async (_count) => {
    const t3Versions = await (0, utils_1.getT3Versions)();
    const sortedT3Versions = t3Versions.sort((a, b) => {
        const aParts = a.split(".").map(Number);
        const bParts = b.split(".").map(Number);
        for (let i = 0; i < aParts.length; i++) {
            const aPart = aParts[i];
            const bPart = bParts[i];
            if (aPart > bPart) {
                return 1;
            }
            else if (aPart < bPart) {
                return -1;
            }
        }
        return 0;
    });
    const existingDiffsMap = (0, exports.getExistingDiffsMap)();
    const newDiffsMap = {};
    const features = ["nextAuth", "prisma", "trpc", "tailwind"];
    for (let i = 0; i < sortedT3Versions.length; i++) {
        const currentVersion = sortedT3Versions[i];
        for (let j = i + 1; j < sortedT3Versions.length; j++) {
            const upgradeVersion = sortedT3Versions[j];
            const combinations = (0, utils_1.arrangements)(features);
            const noFeaturesDiff = `${currentVersion}..${upgradeVersion}`;
            if (!existingDiffsMap[noFeaturesDiff]) {
                newDiffsMap[noFeaturesDiff] = {
                    currentVersion,
                    upgradeVersion,
                    features: {},
                };
            }
            for (const combination of combinations) {
                const features = {
                    nextAuth: combination.includes("nextAuth"),
                    prisma: combination.includes("prisma"),
                    trpc: combination.includes("trpc"),
                    tailwind: combination.includes("tailwind"),
                };
                const key = `${currentVersion}..${upgradeVersion}-${(0, utils_1.getFeaturesString)(features)}`;
                if (existingDiffsMap[key]) {
                    continue;
                }
                console.log(`Missing diff: ${key}`);
                newDiffsMap[key] = {
                    currentVersion,
                    upgradeVersion,
                    features,
                };
            }
        }
    }
    // console.log(
    //   `Found ${
    //     .join("\n")} existing diffs`
    // );
    // console.log(existingDiffsMap);
    console.log(`Found ${Object.keys(newDiffsMap).length} new diffs`);
    // const start = 0;
    // const end = Math.min(count, Object.keys(newDiffsMap).length);
    return Object.entries(newDiffsMap)
        .filter(([_, needed]) => needed)
        .map((x) => x[1]);
    // return Object.keys(newDiffsMap).slice(start, end);
};
exports.getMissingDiffs = getMissingDiffs;
//# sourceMappingURL=fileUtils.js.map