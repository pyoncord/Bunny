import { getCurrentTheme, writeThemeToNative } from "@lib/addons/themes";
import { BundleUpdaterManager } from "@lib/api/native/modules";
import { settings } from "@lib/api/settings";

export function isSafeMode() {
    return settings.safeMode?.enabled === true;
}

export async function toggleSafeMode({
    to = !isSafeMode(),
    reload = true
} = {}) {
    const enabled = (settings.safeMode ??= { enabled: to }).enabled = to;
    const currentColor = getCurrentTheme();
    await writeThemeToNative(enabled ? {} : currentColor?.data ?? {});
    if (reload) setTimeout(() => BundleUpdaterManager.reload(), 500);
}
