import initFixes from "@core/fixes";
import { initCorePlugins } from "@core/plugins";
import initSettings from "@core/ui/settings";
import { patchAssets } from "@lib/api/assets";
import { patchCommands } from "@lib/api/commands";
import { injectFluxInterceptor } from "@lib/api/flux";
import { isThemeSupported } from "@lib/api/native/loader";
import { patchLogHook } from "@lib/debug";
import { initPlugins } from "@lib/managers/plugins";
import { initThemes, patchChatBackground } from "@lib/managers/themes";
import { logger } from "@lib/utils/logger";
import initWindowObject from "@lib/windowObject";
import initSafeMode from "@ui/safeMode";

export default async () => {
    // Themes
    if (isThemeSupported()) {
        try {
            initThemes();
        } catch (e) {
            console.error("[Bunny] Failed to initialize themes...", e);
        }
    }

    // Load everything in parallel
    const unloads = await Promise.all([
        injectFluxInterceptor(),
        patchLogHook(),
        patchAssets(),
        patchCommands(),
        patchChatBackground(),
        initFixes(),
        initSafeMode(),
        initSettings(),
        initCorePlugins(),
    ]);

    // Assign window object
    initWindowObject(unloads);

    // Once done, load plugins
    unloads.push(await initPlugins());

    // We good :)
    logger.log("Bunny is ready!");
};
