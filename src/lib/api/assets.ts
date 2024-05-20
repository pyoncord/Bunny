// TODO: Rewrite the whole thing to fit new metro :3

import { after } from "@lib/api/patcher";
import { getMetroCache, registerAssetCacheId } from "@metro/caches";
import { getImportingModuleId, requireModule } from "@metro/modules";

export const all: Record<string, Asset> = {};

export interface Asset {
    name: string;
    id: number;
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

    const unpatch = after("registerAsset", assetsModule, (args: Asset[], id: number) => {
        const asset = args[0];

        const moduleId = Number(getImportingModuleId());

        registerAssetCacheId(asset.name, moduleId);

        all[asset.name] = {
            ...asset,
            id,
            moduleId
        };
    });

    for (let id = 1; ; id++) {
        const asset = assetsModule.getAssetByID(id);
        if (!asset) break;
        if (all[asset.name]) continue;
        all[asset.name] = { ...asset, id: id };
    }

    return unpatch;
}

export const find = (filter: (a: any) => void): Asset | null | undefined => Object.values(all).find(filter);
export const getAssetByName = (name: string): Asset => all[name];
export const getAssetByID = (id: number): Asset => assetsModule.getAssetByID(id);
export const getAssetIDByName = (name: string) => all[name]?.id ?? requireModule(getMetroCache().assetsIndex[name]);
