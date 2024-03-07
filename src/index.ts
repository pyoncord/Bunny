import initFixes from "@core/fixes";
import { initCorePlugins } from "@core/plugins";
import initSettings from "@core/ui/settings";
import { _patchAssets } from "@lib/api/assets";
import { _patchCommands } from "@lib/api/commands";
import { _injectFluxInterceptor } from "@lib/api/flux";
import { isThemeSupported } from "@lib/api/native/loader";
import { _patchLogHook } from "@lib/debug";
import { _initPlugins } from "@lib/managers/plugins";
import { _initThemes, _patchChatBackground } from "@lib/managers/themes";
import { _patchSettings } from "@lib/ui/settings";
import { logger } from "@lib/utils/logger";
import initWindowObject from "@lib/windowObject";
import initSafeMode from "@ui/safeMode";

export default async () => {
    // Themes
    if (isThemeSupported()) {
        try {
            _initThemes();
        } catch (e) {
            console.error("[Bunny] Failed to initialize themes...", e);
        }
    }

    // Load everything in parallel
    const unloads = await Promise.all([
        _injectFluxInterceptor(),
        _patchSettings(),
        _patchLogHook(),
        _patchAssets(),
        _patchCommands(),
        _patchChatBackground(),
        initSettings(),
        initFixes(),
        initSafeMode(),
        initCorePlugins(),
    ]);

    // Assign window object
    initWindowObject(unloads);

    // Once done, load plugins
    unloads.push(await _initPlugins());

    // We good :)
    logger.log("Bunny is ready!");
};
