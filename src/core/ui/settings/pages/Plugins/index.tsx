import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import PluginCard from "@core/ui/settings/pages/Plugins/components/PluginCard";
import { VdPluginManager } from "@core/vendetta/plugins";
import { findAssetId } from "@lib/api/assets";
import { settings } from "@lib/api/settings";
import { useProxy } from "@lib/api/storage";
import { showToast } from "@lib/ui/toasts";
import { BUNNY_PROXY_PREFIX, VD_PROXY_PREFIX } from "@lib/utils/constants";
import { lazyDestructure } from "@lib/utils/lazy";
import { Author } from "@lib/utils/types";
import { findByProps } from "@metro";
import { Card, Text } from "@metro/common/components";
import { ComponentProps } from "react";

import unifyVdPlugin from "./models/vendetta";

export interface UnifiedPluginModel {
    id: string;
    name: string;
    description?: string;
    authors?: Array<Author | string>;
    icon?: string;

    isEnabled(): boolean;
    usePluginState(): void;
    isInstalled(): boolean;
    toggle(start: boolean): void;
    resolveSheetComponent(): Promise<{ default: React.ComponentType<any>; }>;
    getPluginSettingsComponent(): React.ComponentType<any> | null | undefined;
}

const { openAlert } = lazyDestructure(() => findByProps("openAlert", "dismissAlert"));
const { AlertModal, AlertActions, AlertActionButton } = lazyDestructure(() => findByProps("AlertModal", "AlertActions"));

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
        CardComponent={PluginCard}
        title={Strings.PLUGINS}
        searchKeywords={[
            "name",
            "description",
            p => p.authors?.map(
                (a: Author | string) => typeof a === "string" ? a : a.name
            ).join()
        ]}
        sortOptions={{
            "Name (A-Z)": (a, b) => a.name.localeCompare(b.name),
            "Name (Z-A)": (a, b) => b.name.localeCompare(a.name)
        }}
        safeModeHint={{ message: Strings.SAFE_MODE_NOTICE_PLUGINS }}
        items={items}
        {...props}
    />;
}

export default function Plugins() {
    useProxy(settings);

    return <PluginPage
        useItems={() => useProxy(VdPluginManager.plugins) && Object.values(VdPluginManager.plugins)}
        resolveItem={unifyVdPlugin}
        installAction={{
            label: "Install a plugin",
            fetchFn: async (url: string) => {
                if (!url.startsWith(VD_PROXY_PREFIX) && !url.startsWith(BUNNY_PROXY_PREFIX) && !settings.developerSettings) {
                    openAlert("bunny-plugin-unproxied-confirmation", <AlertModal
                        title="Hold On!"
                        content="You're trying to install a plugin from an external source. This means you're trusting the creator to run their code in this app. Are you sure you want to continue?"
                        extraContent={<Card><Text variant="text-md/bold">{url}</Text></Card>}
                        actions={<AlertActions>
                            <AlertActionButton text="Continue" variant="primary" onPress={() => {
                                VdPluginManager.installPlugin(url)
                                    .then(() => showToast(Strings.TOASTS_INSTALLED_PLUGIN, findAssetId("Check")))
                                    .catch(e => openAlert("bunny-plugin-install-failed", <AlertModal
                                        title="Install Failed"
                                        content={`Unable to install plugin from '${url}':`}
                                        extraContent={<Card><Text variant="text-md/normal">{e instanceof Error ? e.message : String(e)}</Text></Card>}
                                        actions={<AlertActionButton text="Okay" variant="primary" />}
                                    />));
                            }} />
                            <AlertActionButton text="Cancel" variant="secondary" />
                        </AlertActions>}
                    />);
                } else {
                    return await VdPluginManager.installPlugin(url);
                }
            }
        }}
    />;

    // const navigation = NavigationNative.useNavigation();
    // const { width: pageWidth } = useWindowDimensions();

    // const state = useSegmentedControlState({
    //     pageWidth,
    //     items: [
    //         {
    //             label: "Vendetta",
    //             id: "vendetta-plugins",
    //             page: (
    //                 <PluginPage
    //                     useItems={() => useProxy(VdPluginManager.plugins) && Object.values(VdPluginManager.plugins)}
    //                     resolveItem={unifyVdPlugin}
    //                     fetchFunction={(url: string) => VdPluginManager.installPlugin(url)}
    //                 />
    //             )
    //         },
    //         {
    //             label: "Bunny",
    //             id: "bunny-plugins",
    //             page: (
    //                 <PluginPage
    //                     useItems={() => (useNewProxy(pluginSettings), [...registeredPlugins.values()].filter(p => isPluginInstalled(p.id)))}
    //                     resolveItem={unifyBunnyPlugin}
    //                     ListHeaderComponent={() => (
    //                         <View style={{ marginBottom: 10 }}>
    //                             <HelpMessage messageType={0}>
    //                                 Bunny plugin system is in no way ready, try not getting yourself burnt ⚠️
    //                             </HelpMessage>
    //                         </View>
    //                     )}
    //                     ListFooterComponent={() => (
    //                         <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 16, gap: 12 }}>
    //                             <Text variant="heading-lg/bold">{"Looking for more?"}</Text>
    //                             <Button
    //                                 size="lg"
    //                                 text="Browse plugins"
    //                                 icon={findAssetId("discover")}
    //                                 onPress={() => navigateToPluginBrowser(navigation)}
    //                             />
    //                         </View>
    //                     )}
    //                 />
    //             )
    //         },
    //     ]
    // });

    // return (
    //     <View style={{ alignItems: "center", justifyContent: "center", height: "100%" }}>
    //         <View style={{ padding: 8, paddingBottom: 0 }}>
    //             <SegmentedControl state={state} />
    //         </View>
    //         <SegmentedControlPages state={state} />
    //     </View>
    // );
}
