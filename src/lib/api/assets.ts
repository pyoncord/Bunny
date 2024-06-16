import { after } from "@lib/api/patcher";
import { getMetroCache, indexAssetName } from "@metro/caches";
import { getImportingModuleId, requireModule } from "@metro/modules";

// TODO: Deprecate this map, make another that maps to an array of assets (Asset[]) instead
/**
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
            // Though, VD seems to assign the last registered, but doing that breaks HideGiftButton so idk
            // https://github.com/vendetta-mod/Vendetta/blob/rewrite/src/ui/assets.ts
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

export const findAsset = (filter: (a: any) => void): Asset | null | undefined => Object.values(assetsMap).find(filter);
export const requireAssetByName = (name: string): Asset => assetsMap[name];
export const requireAssetByIndex = (id: number): Asset => assetsModule.getAssetByID(id);
export const requireAssetIndex = (name: string) => assetsMap[name]?.index;
