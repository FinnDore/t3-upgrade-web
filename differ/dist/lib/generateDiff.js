"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDiff = exports.paramsSchema = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const fileUtils_1 = require("./fileUtils");
const utils_1 = require("./utils");
exports.paramsSchema = zod_1.z.object({
    currentVersion: zod_1.z.string(),
    upgradeVersion: zod_1.z.string(),
    features: zod_1.z.object({
        nextAuth: zod_1.z.boolean().optional(),
        prisma: zod_1.z.boolean().optional(),
        trpc: zod_1.z.boolean().optional(),
        tailwind: zod_1.z.boolean().optional(),
    }),
});
async function generateDiff(params) {
    const { success } = exports.paramsSchema.safeParse(params);
    if (!success) {
        return { error: "Invalid request body" };
    }
    const { currentVersion, upgradeVersion, features } = exports.paramsSchema.parse(params);
    const featureFlags = Object.entries(features)
        .filter(([, value]) => value)
        .map(([key]) => `--${key}=true`)
        .join(" ");
    const diffPath = (0, fileUtils_1.getDiffPath)({ currentVersion, upgradeVersion, features });
    const featuresString = (0, utils_1.getFeaturesString)(features);
    const diffDir = `/tmp/${currentVersion}..${upgradeVersion}${featuresString ? `-${featuresString}` : ""}`;
    const currentProjectPath = path_1.default.join(diffDir, "current");
    const upgradeProjectPath = path_1.default.join(diffDir, "upgrade");
    // Make sure the directories don't exist
    await (0, fileUtils_1.executeCommand)(`rm -rf ${currentProjectPath}`);
    await (0, fileUtils_1.executeCommand)(`rm -rf ${upgradeProjectPath}`);
    const getCommand = (version, path) => `npx create-t3-app@${version} ${path} --CI ${featureFlags} --noGit --noInstall`;
    if (fs_1.default.existsSync(diffPath)) {
        const differences = fs_1.default.readFileSync(diffPath, "utf8");
        return { differences };
    }
    try {
        await (0, fileUtils_1.executeCommand)(getCommand(currentVersion, currentProjectPath));
        await (0, fileUtils_1.executeCommand)(getCommand(upgradeVersion, upgradeProjectPath));
        // Git init the current project
        await (0, fileUtils_1.executeCommand)(`
      cd ${currentProjectPath} &&
      git init &&
      git add . &&
      git commit -m "Initial commit" &&
      cd ../
    `);
        // Move the upgrade project over the current project
        await (0, fileUtils_1.executeCommand)(`rsync -a --delete --exclude=.git/ ${upgradeProjectPath}/ ${currentProjectPath}/`);
        // Generate the diff
        await (0, fileUtils_1.executeCommand)(`
      cd ${currentProjectPath} &&
      git add . &&
      git diff --staged > ${diffPath} &&
      cd ../
    `);
        // Read the diff
        const differences = fs_1.default.readFileSync(diffPath, "utf8");
        await (0, fileUtils_1.executeCommand)(`rm -rf ${diffDir}`);
        // Send the diff back to the client
        return { differences };
    }
    catch (error) {
        return { error };
    }
}
exports.generateDiff = generateDiff;
//# sourceMappingURL=generateDiff.js.map