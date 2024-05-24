// @ts-nocheck
import { execSync } from "child_process";

const packageName = process.env.DISCORD_PACKAGE_NAME ?? "com.discord";

export function getPackageName() {
    return packageName;
}

export function isADBAvailableAndAppInstalled() {
    try {
        const out = execSync(`adb shell pm list packages ${packageName}`);
        return out.toString().trimEnd() === `package:${packageName}`;
    } catch {
        return false;
    }
}
export async function restartAppFromADB(reversePort) {
    if (typeof reversePort === "number") {
        await execSync(`adb reverse tcp:${reversePort} tcp:${reversePort}`);
    }

    await forceStopAppFromADB();
    await execSync(`adb shell am start ${packageName}/com.discord.main.MainActivity`);
}

export async function forceStopAppFromADB() {
    await execSync(`adb shell am force-stop ${packageName}`);
}
