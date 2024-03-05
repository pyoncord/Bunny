import { after } from "@lib/api/patcher";
import { assets } from "@metro/common";

export const all: Record<string, Asset> = {};

export interface Asset {
    name: string;
    id: number;
}

export function patchAssets() {
    const unpatch = after("registerAsset", assets, (args: Asset[], id: number) => {
        const asset = args[0];
        all[asset.name] = { ...asset, id: id };
    });

    for (let id = 1; ; id++) {
        const asset = assets.getAssetByID(id);
        if (!asset) break;
        if (all[asset.name]) continue;
        all[asset.name] = { ...asset, id: id };
    }

    return unpatch;
}

export const find = (filter: (a: any) => void): Asset | null | undefined => Object.values(all).find(filter);
export const getAssetByName = (name: string): Asset => all[name];
export const getAssetByID = (id: number): Asset => assets.getAssetByID(id);
export const getAssetIDByName = (name: string) => all[name]?.id;
