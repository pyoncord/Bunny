import { patcher } from "@lib/api";
import { registerCommand } from "@lib/api/commands";
import { createStorage } from "@lib/api/storage";
import { logger } from "@lib/utils/logger";

import { registeredPlugins } from ".";
import { BunnyPluginObject } from "./types";

type DisposableFn = (...props: any[]) => () => unknown;
function shimDisposableFn<F extends DisposableFn>(unpatches: (() => void)[], f: F): F {
    return ((...props: Parameters<F>) => {
        const up = f(...props);
        unpatches.push(up);
        return up;
    }) as F;
}

export function createBunnyPluginApi(id: string) {
    const disposers = new Array<DisposableFn>;

    // proxying this would be a good idea
    const object = {
        ...window.bunny,
        api: {
            ...window.bunny.api,
            patcher: {
                before: shimDisposableFn(disposers, patcher.before),
                after: shimDisposableFn(disposers, patcher.after),
                instead: shimDisposableFn(disposers, patcher.instead)
            },
            commands: {
                ...window.bunny.api.commands,
                registerCommand: shimDisposableFn(disposers, registerCommand)
            },
            flux: {
                ...window.bunny.api.flux,
                intercept: shimDisposableFn(disposers, window.bunny.api.flux.intercept)
            }
        },
        // Added something in here? Make sure to also update BunnyPluginProperty in ./types
        plugin: {
            createStorage: <T extends object = any>() => createStorage<T>(`plugins/storage/${id}.json`),
            manifest: registeredPlugins.get(id),
            logger
        }
    } as unknown as BunnyPluginObject;

    return {
        object,
        disposers,
    };
}
