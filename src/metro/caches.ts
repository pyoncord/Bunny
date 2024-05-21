import { ClientInfoManager, MMKVManager } from "@lib/api/native/modules";
import { throttle } from "@lib/utils/throttle";

type ModulesMap = {
    _?: 1;
    [id: number]: 1 | void;
};

interface MetroCacheStore {
    _v: 10;
    _buildNumber: number;
    findIndex: Record<string, ModulesMap | undefined>;
    polyfillIndex: Record<string, ModulesMap | undefined>;
    assetsIndex: Record<string, number>;
}

const BUNNY_METRO_CACHE_KEY = "__bunny_metro_cache_key_v10__";
let _metroCache = null as unknown as MetroCacheStore;

export const getMetroCache = window.__getMetroCache = () => _metroCache;

function buildInitCache() {
    _metroCache = {
        _v: 10,
        _buildNumber: ClientInfoManager.Build,
        findIndex: {},
        polyfillIndex: {},
        assetsIndex: {}
    } as const;

    // Make sure all assets are cached. Delay by a second
    // because force loading it all will results in an unexpected crash.
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
        _metroCache = JSON.parse(rawCache);
        if (_metroCache._buildNumber !== ClientInfoManager.Build) {
            _metroCache = null!;
            throw "cache invalidated; version mismatch";
        }
    } catch {
        buildInitCache();
    }
}

const saveCache = throttle(() => MMKVManager.setItem(BUNNY_METRO_CACHE_KEY, JSON.stringify(_metroCache)));

export function getCacherForUniq(uniq: string, allFind: boolean) {
    let indexObject = _metroCache.findIndex[uniq];

    return {
        cacheId(moduleId: number) {
            indexObject ??= _metroCache.findIndex[uniq] ??= {};
            indexObject[moduleId] = 1;
            saveCache();
        },
        finish() {
            indexObject ??= _metroCache.findIndex[uniq] ??= {};
            if (allFind) indexObject._ = 1;
            saveCache();
        }
    };
}

export function getPolyfillModuleCacher(name: string) {
    let indexObject = _metroCache.polyfillIndex[name];

    return {
        getModules() {
            return require("@metro/modules").getCachedPolyfillModules(name);
        },
        cacheId(moduleId: number) {
            indexObject ??= _metroCache.polyfillIndex[name] ??= {};
            indexObject[moduleId] = 1;
            saveCache();
        }
    };
}

export function registerAssetCacheId(name: string, moduleId: number) {
    if (!isNaN(moduleId)) {
        _metroCache.assetsIndex[name] = moduleId;
        saveCache();
    }
}
