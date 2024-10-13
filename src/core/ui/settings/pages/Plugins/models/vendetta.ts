import { VdPluginManager, VendettaPlugin } from "@core/vendetta/plugins";
import { useProxy } from "@core/vendetta/storage";

import { UnifiedPluginModel } from "..";

export default function unifyVdPlugin(vdPlugin: VendettaPlugin): UnifiedPluginModel {
    return {
        id: vdPlugin.id,
        name: vdPlugin.manifest.name,
        description: vdPlugin.manifest.description,
        authors: vdPlugin.manifest.authors,
        icon: vdPlugin.manifest.vendetta?.icon,

        isEnabled: () => vdPlugin.enabled,
        isInstalled: () => Boolean(vdPlugin && VdPluginManager.plugins[vdPlugin.id]),
        usePluginState() {
            useProxy(VdPluginManager.plugins[vdPlugin.id]);
        },
        toggle(start: boolean) {
            start
                ? VdPluginManager.startPlugin(vdPlugin.id)
                : VdPluginManager.stopPlugin(vdPlugin.id);
        },
        resolveSheetComponent() {
            return import("../sheets/VdPluginInfoActionSheet");
        },
        getPluginSettingsComponent() {
            return VdPluginManager.getSettings(vdPlugin.id);
        },
    };
}
