import { createVendettaObject } from "./vendettaObject";
import * as constants from "@lib/constants";
import * as debug from "@lib/debug";
import * as native from "@lib/native";
import * as plugins from "@lib/plugins";
import * as themes from "@lib/themes";
import * as commands from "@lib/commands";
import * as storage from "@lib/storage";
import * as metro from "@metro/filters";
import * as common from "@metro/common";
import * as components from "@ui/components";
import * as toasts from "@ui/toasts";
import * as alerts from "@ui/alerts";
import * as assets from "@ui/assets";
import * as color from "@ui/color";
import * as utils from "@lib/utils";
import logger from "./logger";
import patcher from "./patcher";
import settings, { loaderConfig } from "./settings";

export default function initWindowObject(unloads: any[]) {
    window.vendetta = createVendettaObject(unloads);
    window.bunny = createBunnyObject(unloads);
}

function createBunnyObject(unloads: any[]) { 
    return {
        patcher: utils.without(patcher, "unpatchAll"),
        metro: { ...metro, common: { ...common } },
        constants: { ...constants },
        utils: { ...utils },
        debug: utils.without({ ...debug }, "versionHash", "patchLogHook", "toggleSafeMode"),
        ui: {
            components: { ...components },
            toasts: { ...toasts },
            alerts: { ...alerts },
            assets: { ...assets },
            ...color,
        },
        native: { ...native },
        plugins: utils.without({ ...plugins }, "initPlugins", "evalPlugin"),
        themes: utils.without({ ...themes }, "initThemes"),
        commands: utils.without({ ...commands }, "patchCommands"),
        storage: { ...storage },
        settings: settings,
        loader: {
            identity: null,
            config: loaderConfig,
        },
        logger: { ...logger },
        version: debug.versionHash,
        unload: () => {
            unloads.filter(i => typeof i === "function").forEach(p => p());
            delete window.vendetta;
        },
    }
}

export type BunnyObject = ReturnType<typeof createBunnyObject>;