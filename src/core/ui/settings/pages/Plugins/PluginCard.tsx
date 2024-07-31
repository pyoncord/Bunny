import { CardWrapper } from "@core/ui/components/AddonCard";
import { findAssetId } from "@lib/api/assets";
import { NavigationNative } from "@metro/common";
import { Card, IconButton, Stack, TableSwitch, Text } from "@metro/common/components";
import { showSheet } from "@ui/sheets";
import { createContext, memo, useContext } from "react";
import { Image, View } from "react-native";

import { UnifiedPluginModel } from ".";
import { usePluginCardStyles } from "./usePluginCardStyles";

const PluginContext = createContext<UnifiedPluginModel>(null!);
const usePlugin = () => useContext(PluginContext);

function Authors() {
    const plugin = usePlugin();
    if (!plugin.authors) return null;

    const children = ["by "];

    for (const author of plugin.authors) {
        children.push(typeof author === "string" ? author : author.name);
        children.push(", ");
    }

    children.pop();

    return <Text variant="text-md/semibold" color="text-muted">
        {children}
    </Text>;
}

function Title() {
    const styles = usePluginCardStyles();
    const plugin = usePlugin();

    const icon = plugin.icon && findAssetId(plugin.icon);

    const textElement = (
        <Text
            numberOfLines={1}
            variant="heading-lg/semibold"
        >
            {plugin.name}
        </Text>
    );

    return !icon ? textElement : <View
        style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6
        }}
    >
        <Image
            style={styles.smallIcon}
            source={icon}
        />
        {textElement}
    </View>;
}

// TODO: Wrap in a Card-ish component with red bg
// TODO: Allow glacing at the error's stack
// function Status() {
//     const plugin = usePlugin();
//     const styles = usePluginCardStyles();
//     const INTERACTIVE_NORMAL = useToken(tokens.colors.INTERACTIVE_NORMAL);

//     if (!plugin.error) return null;

//     return <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
//         <View style={styles.smallIcon}>
//             <Image
//                 tintColor={INTERACTIVE_NORMAL}
//                 source={findAssetId("WarningIcon")}
//             />
//         </View>
//         <Text variant="text-sm/semibold">
//             There was an error while attempting to start this plugin.
//         </Text>
//     </View>;
// }

const Actions = memo(() => {
    const plugin = usePlugin();
    const navigation = NavigationNative.useNavigation();

    return <View style={{ flexDirection: "row", gap: 6 }}>
        <IconButton
            size="sm"
            variant="secondary"
            icon={findAssetId("WrenchIcon")}
            disabled={!plugin.getPluginSettingsComponent()}
            onPress={() => navigation.push("BUNNY_CUSTOM_PAGE", {
                title: plugin.name,
                render: plugin.getPluginSettingsComponent(),
            })}
        />
        <IconButton
            size="sm"
            variant="secondary"
            icon={findAssetId("CircleInformationIcon-primary")}
            onPress={() => void showSheet(
                "PluginInfoActionSheet",
                plugin.resolveSheetComponent(),
                { plugin, navigation }
            )}
        />
    </View>;
});

export default function PluginCard({ item: plugin }: CardWrapper<UnifiedPluginModel>) {
    plugin.usePluginState();

    return (
        <PluginContext.Provider value={plugin}>
            <Card>
                <Stack spacing={16}>
                    {/* <Status /> */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ flexShrink: 1 }}>
                            <Title />
                            <Authors />
                        </View>
                        <View>
                            <Stack spacing={12} direction="horizontal">
                                <Actions />
                                <TableSwitch
                                    value={plugin.isEnabled()}
                                    onValueChange={(v: boolean) => {
                                        plugin.toggle(v);
                                    }}
                                />
                            </Stack>
                        </View>
                    </View>
                    <Text variant="text-md/medium">
                        {plugin.description}
                    </Text>
                </Stack>
            </Card>
        </PluginContext.Provider>
    );
}
