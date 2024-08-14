import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import PluginCard from "@core/ui/settings/pages/Plugins/components/PluginCard";
import { VdPluginManager } from "@core/vendetta/plugins";
import { findAssetId } from "@lib/api/assets";
import { settings } from "@lib/api/settings";
import { useProxy } from "@lib/api/storage";
import { useProxy as useNewProxy } from "@lib/api/storage/new";
import { isPluginInstalled, pluginSettings, registeredPlugins } from "@lib/plugins";
import { Author } from "@lib/utils/types";
import { NavigationNative } from "@metro/common";
import { Button, HelpMessage, SegmentedControl, SegmentedControlPages, Text, useSegmentedControlState } from "@metro/common/components";
import { ComponentProps } from "react";
import { useWindowDimensions, View } from "react-native";

import unifyBunnyPlugin from "./models/bunny";
import unifyVdPlugin from "./models/vendetta";

export interface UnifiedPluginModel {
    id: string;
    name: string;
    description?: string;
    authors?: Array<Author | string>;
    icon?: string;

    isEnabled(): boolean;
    usePluginState(): void;
    toggle(start: boolean): void;
    resolveSheetComponent(): Promise<{ default: React.ComponentType<any>; }>;
    getPluginSettingsComponent(): React.ComponentType<any> | null | undefined;
}

function navigateToPluginBrowser(navigation: any) {
    navigation.push("BUNNY_CUSTOM_PAGE", {
        title: "Plugin Browser",
        render: React.lazy(() => import("../PluginBrowser")),
    });
}

interface PluginPageProps extends Partial<ComponentProps<typeof AddonPage<UnifiedPluginModel>>> {
    useItems: () => unknown[];
}

function PluginPage(props: PluginPageProps) {
    const items = props.useItems();

    return <AddonPage<UnifiedPluginModel>
        card={PluginCard}
        title={Strings.PLUGINS}
        searchKeywords={[
            "name",
            "description",
            p => p.authors?.map(
                (a: Author | string) => typeof a === "string" ? a : a.name
            ).join()
        ]}
        safeModeMessage={Strings.SAFE_MODE_NOTICE_PLUGINS}
        items={items}
        {...props}
    />;
}

export default function Plugins() {
    useProxy(settings);

    const navigation = NavigationNative.useNavigation();
    const { width: pageWidth } = useWindowDimensions();

    const state = useSegmentedControlState({
        pageWidth,
        items: [
            {
                label: "Vendetta",
                id: "vendetta-plugins",
                page: (
                    <PluginPage
                        useItems={() => useProxy(VdPluginManager.plugins) && Object.values(VdPluginManager.plugins)}
                        resolveItem={unifyVdPlugin}
                        fetchFunction={(url: string) => VdPluginManager.installPlugin(url)}
                    />
                )
            },
            {
                label: "Bunny",
                id: "bunny-plugins",
                page: (
                    <PluginPage
                        useItems={() => (useNewProxy(pluginSettings), [...registeredPlugins.values()].filter(p => isPluginInstalled(p.id)))}
                        resolveItem={unifyBunnyPlugin}
                        ListHeaderComponent={() => (
                            <View style={{ marginBottom: 10 }}>
                                <HelpMessage messageType={0}>
                                    Bunny plugin system is in no way ready, try not getting yourself burnt ⚠️
                                </HelpMessage>
                            </View>
                        )}
                        ListFooterComponent={() => (
                            <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 16, gap: 12 }}>
                                <Text variant="heading-lg/bold">{"Looking for more?"}</Text>
                                <Button
                                    size="lg"
                                    text="Browse plugins"
                                    icon={findAssetId("discover")}
                                    onPress={() => navigateToPluginBrowser(navigation)}
                                />
                            </View>
                        )}
                    />
                )
            },
        ]
    });

    return (
        <View style={{ alignItems: "center", justifyContent: "center", height: "100%" }}>
            <View style={{ padding: 8, paddingBottom: 0 }}>
                <SegmentedControl state={state} />
            </View>
            <SegmentedControlPages state={state} />
        </View>
    );
}
