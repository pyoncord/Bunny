import { ClientInfoManager, MMKVManager } from "@lib/api/native/modules";
import { throttle } from "@lib/utils/throttle";

const CACHE_VERSION = 24;
const BUNNY_METRO_CACHE_KEY = `__bunny_metro_cache_key_v${CACHE_VERSION}__`;

export enum ExportsFlags {
    EXISTS = 1 << 0,
    BLACKLISTED = 1 << 1
}

type ModulesMap = {
    _?: 1;
    [id: number]: number;
};

let _metroCache = null as unknown as ReturnType<typeof buildInitCache>;

export const getMetroCache = window.__getMetroCache = () => _metroCache;

function buildInitCache() {
    const cache = {
        _v: CACHE_VERSION,
        _buildNumber: ClientInfoManager.Build as number,
        exportsIndex: {} as Record<string, number>,
        findIndex: {} as Record<string, ModulesMap | undefined>,
        polyfillIndex: {} as Record<string, ModulesMap | undefined>,
        assetsIndex: {} as Record<string, number>
    } as const;

    // Make sure all assets are cached. Delay by a second
    // because force loading it all will results in an unexpected crash.
    setTimeout(() => {
        for (const id in window.modules) {
            require("@metro/modules").requireModule(id);
        }
    }, 1000);

    _metroCache = cache;
    return cache;
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

const saveCache = throttle(() => {
    MMKVManager.setItem(BUNNY_METRO_CACHE_KEY, JSON.stringify(_metroCache));
});

function extractExportsFlags(moduleExports: any) {
    if (!moduleExports) return 0;

    const bit = ExportsFlags.EXISTS;
    return bit;
}

export function indexExportsFlags(moduleId: number, moduleExports: any) {
    const flags = extractExportsFlags(moduleExports);
    if (flags !== ExportsFlags.EXISTS) {
        _metroCache.exportsIndex[moduleId] = flags;
    }
}

export function indexBlacklistFlag(id: number) {
    _metroCache.exportsIndex[id] |= ExportsFlags.BLACKLISTED;
}

export function getCacherForUniq(uniq: string, allFind: boolean) {
    let indexObject = _metroCache.findIndex[uniq];

    return {
        cacheId(moduleId: number, exports: any) {
            indexObject ??= _metroCache.findIndex[uniq] ??= {};
            // TODO: A log here perhaps
            indexObject[moduleId] ??= extractExportsFlags(exports);

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
