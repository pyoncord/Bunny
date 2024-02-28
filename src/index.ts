import { patchLogHook } from "@lib/debug";
import { patchCommands } from "@/lib/api/commands";
import { initPlugins } from "@lib/managers/plugins";
import { patchChatBackground } from "@lib/managers/themes";
import { patchAssets } from "@/lib/api/assets";
import initQuickInstall from "@ui/quickInstall";
import initSafeMode from "@ui/safeMode";
import initSettings from "@ui/settings";
import initFixes from "@/core/fixes";
import logger from "@lib/utils/logger";
import initWindowObject from "@lib/windowObject";

export default async () => {
    // Load everything in parallel
    const unloads = await Promise.all([
        patchLogHook(),
        patchAssets(),
        patchCommands(),
        patchChatBackground(),
        initFixes(),
        initSafeMode(),
        initSettings(),
        initQuickInstall(),
    ]);

    // Assign window object
    initWindowObject(unloads);

    // Once done, load plugins
    unloads.push(await initPlugins());

    // We good :)
    logger.log("Vendetta is ready!");
}
