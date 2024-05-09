import { ClientInfoManager, MMKVManager } from "@lib/api/native/modules";
import { throttle } from "@lib/utils/throttle";
import SparkMD5 from "spark-md5";

// fucked types right here
interface MetroCacheStore {
    v: 4;
    buildNumber: number;
    findCache: Record<string, Record<number | "_", 1 | undefined> | undefined>;
    polyfillCache: Record<string, Record<number, 1 | undefined> | undefined>;
    assetsCache: Record<string, number>;
}

const PYON_METRO_CACHE_KEY = "__bunny_metro_cache_key_v4__";

let metroCache = null as unknown as MetroCacheStore;

export function getMetroCache() {
    return metroCache;
}
window.getMetroCache = getMetroCache;

export function getFuncUniqCall() {
    const { stack } = new Error();
    return SparkMD5.hash(stack!);
}

function buildInitCache() {
    metroCache = {
        v: 4,
        buildNumber: ClientInfoManager.Build,
        findCache: {},
        polyfillCache: {},
        assetsCache: {}
    } as const;

    // Make sure all assets are cached
    for (const id in window.modules) {
        require("@metro/filters").requireModule(id);
    }
}

export async function initMetroCache() {
    const rawCache = await MMKVManager.getItem(PYON_METRO_CACHE_KEY);
    if (rawCache == null) return buildInitCache();

    try {
        metroCache = JSON.parse(rawCache);
        if (metroCache.buildNumber !== ClientInfoManager.Build) {
            throw "cache invalidated; version mismatch";
        }
    } catch {
        buildInitCache();
    }
}

const saveCache = throttle(() => {
    MMKVManager.setItem(PYON_METRO_CACHE_KEY, JSON.stringify(metroCache));
});

export function registerModuleFindCacheId(uniqueId: string, moduleId: number, all: boolean) {
    (metroCache.findCache[uniqueId] ??= { _: undefined })[moduleId] = 1;
    if (all) metroCache.findCache[uniqueId]!._ ||= 1;
    saveCache();
}

export function registerPolyfillCacheId(name: string, moduleId: number, remove = false) {
    if (remove) delete metroCache.polyfillCache[name]?.[moduleId];
    else (metroCache.polyfillCache[name] ??= {})[moduleId] = 1;
    saveCache();
}

export function registerAssetCacheId(name: string, moduleId: number) {
    if (isNaN(moduleId)) return;
    metroCache.assetsCache[name] = moduleId;
    saveCache();
}
