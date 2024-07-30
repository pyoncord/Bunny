import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import PluginCard from "@core/ui/settings/pages/Plugins/PluginCard";
import { VdPluginManager, VendettaPlugin } from "@core/vendetta/plugins";
import { settings } from "@lib/api/settings";
import { useProxy } from "@lib/api/storage";
import { useProxy as useProxyNew } from "@lib/api/storage/new";
import { getId, getPluginSettingsComponent, isPluginEnabled, pluginSettings, registeredPlugins, startPlugin, stopPlugin } from "@lib/plugins";
import { BunnyPluginManifest } from "@lib/plugins/types";
import { Author } from "@lib/utils/types";
import { SegmentedControl, SegmentedControlPages, useSegmentedControlState } from "@metro/common/components";
import { useWindowDimensions, View } from "react-native";

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

function resolveFromBunnyPlugin(manifest: BunnyPluginManifest): PluginManifest {

    return {
        id: manifest.id,
        name: manifest.name,
        description: manifest.description,
        authors: manifest.authors,
        isEnabled() {
            return isPluginEnabled(getId(manifest));
        },
        usePluginState() {
            useProxyNew(pluginSettings);
        },
        toggle(start: boolean) {
            start
                ? startPlugin(getId(manifest))
                : stopPlugin(getId(manifest));
        },
        resolveSheetComponent() {
            return import("./sheets/PluginInfoActionSheet");
        },
        getPluginSettingsComponent() {
            return getPluginSettingsComponent(getId(manifest));
        },
    };
}

function Page({ items, resolveItem, fetchFunction }: Record<string, any>) {
    return <AddonPage<PluginManifest>
        card={PluginCard}
        title={Strings.PLUGINS}
        searchKeywords={[
            "name",
            "description",
            p => p.authors?.map((a: Author | string) => typeof a === "string" ? a : a.name).join()
        ]}
        items={items}
        resolveItem={resolveItem}
        fetchFunction={fetchFunction}
        safeModeMessage={Strings.SAFE_MODE_NOTICE_PLUGINS}
    />;
}

export default function Plugins() {
    useProxy(settings);

    const { width: pageWidth } = useWindowDimensions();

    const state = useSegmentedControlState({
        pageWidth,
        items: [
            {
                label: "Vendetta",
                id: "vendetta-plugins",
                page: (
                    <Page
                        items={VdPluginManager.plugins}
                        resolveItem={resolveFromVdPlugin}
                        fetchFunction={(url: string) => VdPluginManager.installPlugin(url)}
                    />
                )
            },
            {
                label: "Bunny",
                id: "bunny-plugins",
                page: (
                    <Page
                        items={Object.fromEntries(registeredPlugins.entries())}
                        resolveItem={resolveFromBunnyPlugin}
                    />
                )
            },
        ]
    });

    return <View style={{ margin: 8, gap: 8, alignItems: "center", justifyContent: "center", height: "100%" }}>
        <SegmentedControl state={state} />
        <SegmentedControlPages state={state} />
    </View>;
}
