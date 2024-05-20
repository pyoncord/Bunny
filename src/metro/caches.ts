import { ClientInfoManager, MMKVManager } from "@lib/api/native/modules";
import { throttle } from "@lib/utils/throttle";

import { getCachedPolyfillModules } from "./modules";

const BUNNY_METRO_CACHE_KEY = "__bunny_metro_cache_key_v5__";

type ModulesMap = {
    _?: 1;
    [id: number]: 1 | void;
};

interface MetroCacheStore {
    v: 5;
    buildNumber: number;
    findIndex: Record<string, ModulesMap | undefined>;
    polyfillCache: Record<string, ModulesMap | undefined>;
    assetsCache: Record<string, number>;
}

let metroCache = null as unknown as MetroCacheStore;

export function getMetroCache() {
    return metroCache;
}

function buildInitCache() {
    metroCache = {
        v: 5,
        buildNumber: ClientInfoManager.Build,
        findIndex: {},
        polyfillCache: {},
        assetsCache: {}
    } as const;

    // Make sure all assets are cached. Delay by a second
    // because force loading all will results in an unexpected crash.
    setTimeout(() => {
        for (const id in window.modules) {
            require("@metro/modules").requireModule(id);
        }
    }, 1000);
}

export async function initMetroCache() {
    const rawCache = await MMKVManager.getItem(BUNNY_METRO_CACHE_KEY);
    if (rawCache == null) return void buildInitCache();

    try {
        metroCache = JSON.parse(rawCache);
        if (metroCache.buildNumber !== ClientInfoManager.Build) {
            metroCache = null!;
            throw "cache invalidated; version mismatch";
        }
    } catch {
        buildInitCache();
    }
}

const saveCache = throttle(() => MMKVManager.setItem(BUNNY_METRO_CACHE_KEY, JSON.stringify(metroCache)));

export function getCacherForUniq(uniq: string, allFind: boolean) {
    const indexObject = metroCache.findIndex[uniq] ??= {};

    return {
        cacheId(moduleId: number) {
            indexObject[moduleId] = 1;
            saveCache();
        },
        finish() {
            if (allFind) indexObject._ = 1;
            saveCache();
        }
    };
}

export function getPolyfillModuleCacher(name: string) {
    const indexObject = metroCache.polyfillCache[name] ??= {};

    return {
        getModules() {
            return getCachedPolyfillModules(name);
        },
        cacheId(moduleId: number) {
            indexObject[moduleId] = 1;
            saveCache();
        }
    };
}

export function registerAssetCacheId(name: string, moduleId: number) {
    if (!isNaN(moduleId)) {
        metroCache.assetsCache[name] = moduleId;
        saveCache();
    }
}
