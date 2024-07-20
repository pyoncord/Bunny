import { ClientInfoManager, MMKVManager } from "@lib/api/native/modules";
import { debounce } from "es-toolkit";

import { ModuleFlags, ModulesMapInternal } from "./enums";

const CACHE_VERSION = 52;
const BUNNY_METRO_CACHE_KEY = "__bunny_metro_cache_key__";

type ModulesMap = {
    [flag in number | `_${ModulesMapInternal}`]?: ModuleFlags;
};

let _metroCache = null as unknown as ReturnType<typeof buildInitCache>;

export const getMetroCache = window.__getMetroCache = () => _metroCache;

function buildInitCache() {
    const cache = {
        _v: CACHE_VERSION,
        _buildNumber: ClientInfoManager.Build as number,
        _modulesCount: Object.keys(window.modules).length,
        exportsIndex: {} as Record<string, number>,
        findIndex: {} as Record<string, ModulesMap | undefined>,
        polyfillIndex: {} as Record<string, ModulesMap | undefined>,
        assetsIndex: {} as Record<string, ModulesMap | undefined>
    } as const;

    // Force load all modules so useful modules are pre-cached. Delay by a second
    // because force loading it all will results in an unexpected crash.
    setTimeout(() => {
        for (const id in window.modules) {
            require("@metro/modules").requireModule(id);
        }
    }, 100);

    _metroCache = cache;
    return cache;
}

// Store in file system
export async function initMetroCache() {
    const rawCache = await MMKVManager.getItem(BUNNY_METRO_CACHE_KEY);
    if (rawCache == null) return void buildInitCache();

    try {
        _metroCache = JSON.parse(rawCache);
        if (_metroCache._v !== CACHE_VERSION) {
            _metroCache = null!;
            throw "cache invalidated; cache version outdated";
        }
        if (_metroCache._buildNumber !== ClientInfoManager.Build) {
            _metroCache = null!;
            throw "cache invalidated; version mismatch";
        }
        if (_metroCache._modulesCount !== Object.keys(window.modules).length) {
            _metroCache = null!;
            throw "cache invalidated; modules count mismatch";
        }
    } catch {
        buildInitCache();
    }
}

const saveCache = debounce(() => {
    MMKVManager.setItem(BUNNY_METRO_CACHE_KEY, JSON.stringify(_metroCache));
}, 1000);

function extractExportsFlags(moduleExports: any) {
    if (!moduleExports) return undefined;

    const bit = ModuleFlags.EXISTS;
    return bit;
}

export function indexExportsFlags(moduleId: number, moduleExports: any) {
    const flags = extractExportsFlags(moduleExports);
    if (flags && flags !== ModuleFlags.EXISTS) {
        _metroCache.exportsIndex[moduleId] = flags;
    }
}

export function indexBlacklistFlag(id: number) {
    _metroCache.exportsIndex[id] |= ModuleFlags.BLACKLISTED;
}

export function getCacherForUniq(uniq: string, allFind: boolean) {
    const indexObject = _metroCache.findIndex[uniq] ??= {};

    return {
        cacheId(moduleId: number, exports: any) {
            indexObject[moduleId] ??= extractExportsFlags(exports);

            saveCache();
        },
        // Finish may not be called by single find
        finish(notFound: boolean) {
            if (allFind) indexObject[`_${ModulesMapInternal.FULL_LOOKUP}`] = 1;
            if (notFound) indexObject[`_${ModulesMapInternal.NOT_FOUND}`] = 1;

            saveCache();
        }
    };
}

export function getPolyfillModuleCacher(name: string) {
    const indexObject = _metroCache.polyfillIndex[name] ??= {};

    return {
        getModules() {
            return require("@metro/modules").getCachedPolyfillModules(name);
        },
        cacheId(moduleId: number) {
            indexObject[moduleId] = 1;
            saveCache();
        },
        finish() {
            indexObject[`_${ModulesMapInternal.FULL_LOOKUP}`] = 1;
            saveCache();
        }
    };
}

export function indexAssetName(name: string, moduleId: number) {
    if (!isNaN(moduleId)) {
        (_metroCache.assetsIndex[name] ??= {})[moduleId] = 1;
        saveCache();
    }
}
