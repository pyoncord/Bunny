import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import PluginCard from "@core/ui/settings/pages/Plugins/PluginCard";
import { VdPluginManager, VendettaPlugin } from "@core/vendetta/plugins";
import { settings } from "@lib/api/settings";
import { useProxy } from "@lib/api/storage";
import { Author } from "@lib/utils/types";

export interface PluginManifest {
    id: string;
    name: string;
    description?: string;
    authors?: Array<Author | string>;
    icon?: string;

    isEnabled(): boolean;
    usePluginState(): void;
    toggle(start: boolean): void;
    resolveSheetComponent(): Promise<{ default: React.ComponentType<any>; }>;
    getPluginSettingsComponent(): React.ComponentType<any> | null;
}

function resolveFromVdPlugin(vdPlugin: VendettaPlugin): PluginManifest {
    return {
        id: vdPlugin.id,
        name: vdPlugin.manifest.name,
        description: vdPlugin.manifest.description,
        authors: vdPlugin.manifest.authors,
        icon: vdPlugin.manifest.vendetta?.icon,
        isEnabled() {
            return vdPlugin.enabled;
        },
        usePluginState() {
            useProxy(VdPluginManager.plugins[vdPlugin.id]);
        },
        toggle(start: boolean) {
            start
                ? VdPluginManager.startPlugin(vdPlugin.id)
                : VdPluginManager.stopPlugin(vdPlugin.id);
        },
        resolveSheetComponent() {
            return import("./sheets/VdPluginInfoActionSheet");
        },
        getPluginSettingsComponent() {
            return VdPluginManager.getSettings(vdPlugin.id);
        },
    };
}

export default function Plugins() {
    useProxy(settings);

    return (
        <AddonPage<PluginManifest>
            title={Strings.PLUGINS}
            searchKeywords={[
                "name",
                "description",
                p => p.authors?.map((a: Author | string) => typeof a === "string" ? a : a.name).join()
            ]}
            items={VdPluginManager.plugins}
            resolveItem={resolveFromVdPlugin}
            fetchFunction={async () => { /** TODO */ }}
            safeModeMessage={Strings.SAFE_MODE_NOTICE_PLUGINS}
            card={PluginCard}
        />
    );
}
