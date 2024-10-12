import { after } from "@lib/api/patcher";
import { getMetroCache, indexAssetName } from "@metro/internals/caches";
import { getImportingModuleId, requireModule } from "@metro/internals/modules";

// TODO: Deprecate this map, make another that maps to an array of assets (Asset[]) instead
/**
 * @internal
 * Pitfall: Multiple assets may have the same name, this is fine if we require the asset only for display,\
 * but not when used to get the registered id/index. In some condition, this would break some plugins like HideGiftButton that gets id by name for patching.\
 */
export const assetsMap: Record<string, Asset> = new Proxy<any>({}, {
    get(cache, p) {
        if (typeof p !== "string") return undefined;
        if (cache[p]) return cache[p];

        const moduleIds = getMetroCache().assetsIndex[p];
        if (moduleIds == null) return undefined;

        for (const id in moduleIds) {
            const assetIndex = requireModule(Number(id));
            if (typeof assetIndex !== "number") continue;

            const assetDefinition = assetsModule.getAssetByID(assetIndex);
            if (!assetDefinition) continue;

            assetDefinition.index ??= assetDefinition.id ??= assetIndex;
            assetDefinition.moduleId ??= id;

            // ??= is intended, we only assign to the first asset registered
            cache[p] ??= assetDefinition;
        }

        return cache[p];
    },
    ownKeys(cache) {
        const keys = [] as Array<string>;
        for (const key in getMetroCache().assetsIndex) {
            cache[key] = this.get!(cache, key, {});
            if (cache[key]) keys.push(key);
        }
        return keys;
    },
});

export interface Asset {
    /** @deprecated */
    id: number;
    index: number;
    name: string;
    moduleId: number;
}

interface AssetModule {
    registerAsset(assetDefinition: any): number;
    getAssetByID(id: number): any;
}

let assetsModule: AssetModule;

/**
 * @internal
 */
export function patchAssets(module: AssetModule) {
    if (assetsModule) return;
    assetsModule = module;

    const unpatch = after("registerAsset", assetsModule, ([asset]: Asset[]) => {
        const moduleId = getImportingModuleId();
        if (moduleId !== -1) indexAssetName(asset.name, moduleId);
    });

    return unpatch;
}

/**
 * Returns the first asset registry by its registry id (number), name (string) or given filter (function)
 */
export function findAsset(id: number): Asset | undefined;
export function findAsset(name: string): Asset | undefined;
export function findAsset(filter: (a: Asset) => boolean): Asset | undefined;

export function findAsset(param: number | string | ((a: Asset) => boolean)) {
    if (typeof param === "number") return assetsModule.getAssetByID(param);
    if (typeof param === "string") return assetsMap[param];
    return Object.values(assetsMap).find(param);
}

/**
 * Returns the first asset ID in the registry with the given name
 */
export function findAssetId(name: string) {
    return assetsMap[name]?.index;
}

