import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import PluginCard from "@core/ui/settings/pages/Plugins/PluginCard";
import { VdPluginManager } from "@core/vendetta/plugins";
import { findAssetId } from "@lib/api/assets";
import { settings } from "@lib/api/settings";
import { useProxy } from "@lib/api/storage";
import { registeredPlugins } from "@lib/plugins";
import { Author } from "@lib/utils/types";
import { NavigationNative } from "@metro/common";
import { Button, SegmentedControl, SegmentedControlPages, Text, useSegmentedControlState } from "@metro/common/components";
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
    getPluginSettingsComponent(): React.ComponentType<any> | null;
}

function navigateToPluginBrowser(navigation: any) {
    navigation.push("BUNNY_CUSTOM_PAGE", {
        title: "Plugin Browser",
        render: React.lazy(() => import("../PluginBrowser")),
    });
}

function Page(props: Partial<ComponentProps<typeof AddonPage<UnifiedPluginModel>>>) {
    return <AddonPage<UnifiedPluginModel>
        card={PluginCard}
        title={Strings.PLUGINS}
        searchKeywords={[
            "name",
            "description",
            p => p.authors?.map((a: Author | string) => typeof a === "string" ? a : a.name).join()
        ]}
        safeModeMessage={Strings.SAFE_MODE_NOTICE_PLUGINS}
        items={props.items!}
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
                    <Page
                        items={Object.values(VdPluginManager.plugins)}
                        resolveItem={unifyVdPlugin}
                        fetchFunction={(url: string) => VdPluginManager.installPlugin(url)}
                    />
                )
            },
            {
                label: "Bunny",
                id: "bunny-plugins",
                page: (
                    <Page
                        items={[...registeredPlugins.values()]}
                        resolveItem={unifyBunnyPlugin}
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

    return <View
        style={{
            margin: 8,
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
            height: "100%"
        }}
    >
        <SegmentedControl state={state} />
        <SegmentedControlPages state={state} />
    </View>;
}
