// TODO: Rewrite the whole thing to fit new metro :3

import { after } from "@lib/api/patcher";
import { getMetroCache, registerAssetCacheId } from "@metro/caches";
import { getImportingModuleId, requireModule } from "@metro/modules";

export const assetsMap: Record<string, Asset> = new Proxy<any>({}, {
    get(target, p) {
        if (typeof p !== "string") return undefined;
        if (target[p]) return target[p];

        const moduleId = getMetroCache().assetsIndex[p];
        if (moduleId == null) return undefined;

        const assetIndex = requireModule(moduleId);
        const assetDefinition = assetsModule.getAssetByID(assetIndex);

        assetDefinition.index ??= assetDefinition.id ??= assetIndex;
        assetDefinition.moduleId ??= moduleId;

        return target[p] = assetDefinition;
    },
    ownKeys(target) {
        const keys = Reflect.ownKeys(getMetroCache().assetsIndex);
        for (const key of keys) target[key] = this.get!(target, key, {});
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
        if (moduleId !== -1) registerAssetCacheId(asset.name, moduleId);
    });

    return unpatch;
}

export const findAsset = (filter: (a: any) => void): Asset | null | undefined => Object.values(assetsMap).find(filter);
export const requireAssetByName = (name: string): Asset => assetsMap[name];
export const requireAssetByIndex = (id: number): Asset => assetsModule.getAssetByID(id);
export const requireAssetIndex = (name: string) => assetsMap[name]?.index;

