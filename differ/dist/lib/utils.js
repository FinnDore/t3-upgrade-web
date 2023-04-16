"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrangements = exports.extractVersionsAndFeatures = exports.getFeatureUrl = exports.getFeaturesString = exports.getT3VersionsGroupedByMajor = exports.getT3Versions = void 0;
const getT3Versions = async () => {
    const response = await fetch("https://api.github.com/repos/t3-oss/create-t3-app/releases");
    const data = (await response.json());
    const versions = data.map((release) => release.tag_name.split("@")[1] ?? "");
    const actualVersions = versions.filter((version) => version !== "");
    return actualVersions;
};
exports.getT3Versions = getT3Versions;
const getT3VersionsGroupedByMajor = async () => {
    const actualVersions = await (0, exports.getT3Versions)();
    const versionsGroupedByMajor = {};
    actualVersions.forEach((version) => {
        const [major] = version.split(".");
        if (!major) {
            return;
        }
        if (!versionsGroupedByMajor[major]) {
            versionsGroupedByMajor[major] = [];
        }
        versionsGroupedByMajor[major]?.push(version);
    });
    return versionsGroupedByMajor;
};
exports.getT3VersionsGroupedByMajor = getT3VersionsGroupedByMajor;
const getFeaturesString = (features) => {
    return Object.entries(features)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .join("-");
};
exports.getFeaturesString = getFeaturesString;
const getFeatureUrl = (feature) => {
    if (feature === "nextAuth") {
        return "https://next-auth.js.org/";
    }
    else if (feature === "prisma") {
        return "https://www.prisma.io/";
    }
    else if (feature === "trpc") {
        return "https://trpc.io/";
    }
    else if (feature === "tailwind") {
        return "https://tailwindcss.com/";
    }
    else {
        throw new Error(`Unknown feature: ${feature}`);
    }
};
exports.getFeatureUrl = getFeatureUrl;
const extractVersionsAndFeatures = (slug) => {
    const regex = /(?<currentVersion>\d+\.\d+\.\d+).*(?<upgradeVersion>\d+\.\d+\.\d+)/;
    const match = slug.match(regex) || null;
    if (!match) {
        return null;
    }
    const { currentVersion, upgradeVersion } = match.groups;
    return {
        currentVersion: currentVersion,
        upgradeVersion: upgradeVersion,
        features: {
            nextAuth: slug.includes("nextAuth"),
            prisma: slug.includes("prisma"),
            trpc: slug.includes("trpc"),
            tailwind: slug.includes("tailwind"),
        },
    };
};
exports.extractVersionsAndFeatures = extractVersionsAndFeatures;
const arrangements = (array) => {
    const result = [[]];
    for (const element of array) {
        const length = result.length;
        for (let i = 0; i < length; i++) {
            const subset = result[i].slice();
            subset.push(element);
            result.push(subset);
        }
    }
    return result
        .filter((subset) => subset.length > 0)
        .map((subset) => subset.sort().join("-"));
};
exports.arrangements = arrangements;
//# sourceMappingURL=utils.js.map