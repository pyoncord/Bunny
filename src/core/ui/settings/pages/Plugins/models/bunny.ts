import { useProxy } from "@lib/api/storage/new";
import { disablePlugin, enablePlugin, getId, getPluginSettingsComponent,isPluginEnabled, pluginSettings } from "@lib/plugins";
import { BunnyPluginManifest } from "@lib/plugins/types";

import { UnifiedPluginModel } from "..";

export default function unifyBunnyPlugin(manifest: BunnyPluginManifest): UnifiedPluginModel {
    return {
        id: manifest.id,
        name: manifest.name,
        description: manifest.description,
        authors: manifest.authors,
        isEnabled() {
            return isPluginEnabled(getId(manifest));
        },
        usePluginState() {
            useProxy(pluginSettings);
        },
        toggle(start: boolean) {
            start
                ? enablePlugin(getId(manifest), true)
                : disablePlugin(getId(manifest));
        },
        resolveSheetComponent() {
            return import("../sheets/PluginInfoActionSheet");
        },
        getPluginSettingsComponent() {
            return getPluginSettingsComponent(getId(manifest));
        },
    };
}
