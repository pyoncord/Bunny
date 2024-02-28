import { createVendettaObject } from "../core/vendettaObject";

import * as api from "@lib/api";
import * as debug from "@lib/debug";
import * as managers from "@lib/managers";
import * as metro from "@lib/metro";
import * as settings from "@lib/settings";
import * as ui from "@lib/ui";
import * as utils from "@lib/utils";

import patcher from "@lib/api/patcher";

// You may now worry about my mental state.
function createBunnyObject(unloads: any[]) {
    return {
        api: {
            commands: { ...api.commands },
            native: {
                fs: { ...api.native.fs },
                modules: { ...api.native.modules },
                loader: { ...api.native.loader }
            },
            storage: { ...api.storage },
            assets: { ...api.assets },
            patcher: {
                before: patcher.before,
                instead: patcher.instead,
                after: patcher.after
            }
        },
        managers: {
            plugins: { ...managers.plugins },
            themes: { ...managers.themes }
        },
        metro: {
            common: { ...metro.common },
            filters: { ...metro.filters },
            ...metro.filters
        },
        ui: {
            components: { ...ui.components },
            alerts: { ...ui.alerts },
            color: { ...ui.color },
            toasts: { ...ui.toasts },
        },
        utils: {
            constants: { ...utils.constants },
            types: { ...utils.types },
            logger: { ...utils.logger }
        },
        settings: {
            settings: settings.settings,
            loaderConfig: { ...settings.loaderConfig }
        },
        debug: { ...debug },
        version: debug.versionHash,
        unload: () => {
            unloads.filter(i => typeof i === "function").forEach(p => p());
            // @ts-expect-error
            delete window.bunny;
        },
    }
}

export type BunnyObject = ReturnType<typeof createBunnyObject>;

export default function initWindowObject(unloads: any[]) {
    window.vendetta = createVendettaObject(unloads);
    window.bunny = createBunnyObject(unloads);
}
