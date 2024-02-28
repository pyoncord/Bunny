import { createVendettaObject } from "../core/vendettaObject";
import * as constants from "@lib/utils/constants";
import * as native from "@lib/api/native";
import * as plugins from "@lib/managers/plugins";
import * as themes from "@lib/managers/themes";
import * as commands from "@/lib/api/commands";
import * as storage from "@/lib/api/storage";
import * as common from "@metro/common";
import * as components from "@ui/components";
import * as toasts from "@ui/toasts";
import * as alerts from "@ui/alerts";
import * as assets from "@/lib/api/assets";
import * as color from "@ui/color";
import logger from "./utils/logger";
import patcher from "./api/patcher";

import * as api from "@lib/api";
import * as managers from "@lib/api";
import * as metro from "@lib/metro";
import * as ui from "@lib/ui";
import * as utils from "@lib/utils";
import * as debug from "@lib/debug";
import * as settings from "@lib/settings";

function createBunnyObject(unloads: any[]) { 
    return {
        api: {
            commands: { ...commands },
            native: { ...native },
            storage: { ...storage },
            assets: { ...assets },
            patcher: { ...patcher }
        },
        managers: { ...managers },
        metro: { ...metro },
        ui: { ...ui },
        utils: { ...utils },
        settings,
        version: debug.versionHash,
        unload: () => {
            unloads.filter(i => typeof i === "function").forEach(p => p());
            // @ts-expect-error
            delete window.bunny;
        },
    }
}

const dest = { ...api };
type Y = typeof dest;

export type BunnyObject = ReturnType<typeof createBunnyObject>;

export default function initWindowObject(unloads: any[]) {
    window.vendetta = createVendettaObject(unloads);
    window.bunny = createBunnyObject(unloads);
}
