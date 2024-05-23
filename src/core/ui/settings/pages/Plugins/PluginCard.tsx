import { CardWrapper } from "@core/ui/components/AddonCard";
import { requireAssetIndex } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { BunnyPlugin, startPlugin, stopPlugin } from "@lib/managers/plugins";
import { showSheet } from "@lib/ui/sheets";
import { lazyDestructure } from "@lib/utils/lazy";
import { findByProps } from "@metro";
import { NavigationNative, tokens } from "@metro/common";
import { Card, IconButton, Stack, TableSwitch, Text } from "@metro/common/components";
import { createContext, useContext } from "react";
import { Image, View } from "react-native";

import { usePluginCardStyles } from "./usePluginCardStyles";

const { useToken } = lazyDestructure(() => findByProps("useToken"));
const PluginContext = createContext<BunnyPlugin>(null!);
const usePlugin = () => useContext(PluginContext);

function Authors() {
    const plugin = usePlugin();
    const children = ["by "];

    for (const author of plugin.manifest.authors) {
        children.push(author.name);
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

    return <Text variant="heading-lg/semibold">
        {plugin.manifest.vendetta?.icon && <>
            <Image
                style={styles.iconStyle}
                source={{
                    // This is pretty dirty but RN won't listen if I declare height and width somewhere else
                    ...Image.resolveAssetSource(
                        requireAssetIndex(plugin.manifest.vendetta?.icon)
                    ),
                    height: 18,
                    width: 18
                }}
            />
            {" "}
        </>}
        {plugin.manifest.name}
    </Text>;
}

// TODO: Allow glacing at the error's stack
function Status() {
    const plugin = usePlugin();
    const TEXT_NORMAL = useToken(tokens.colors.TEXT_NORMAL);

    if (!plugin.error) return null;

    return <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Image
            tintColor={TEXT_NORMAL}
            source={{
                ...Image.resolveAssetSource(
                    requireAssetIndex("WarningIcon")
                ),
                height: 18,
                width: 18
            }}
        />
        <Text variant="text-sm/semibold">
            There was an error while attempting to start this plugin.
        </Text>
    </View>;
}

export default function PluginCard({ item: plugin }: CardWrapper<BunnyPlugin>) {
    const navigation = NavigationNative.useNavigation();
    useProxy(plugin);

    return (
        <PluginContext.Provider value={plugin}>
            <Card>
                <Stack spacing={16}>
                    <Status />
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Stack spacing={0}>
                            <Title />
                            <Authors />
                        </Stack>
                        <View style={{ marginLeft: "auto" }}>
                            <Stack spacing={12} direction="horizontal">
                                <IconButton
                                    onPress={() => {
                                        showSheet(
                                            "PluginInfoActionSheet",
                                            import("./sheets/PluginInfoActionSheet"),
                                            { plugin, navigation }
                                        );
                                    }}
                                    size="sm"
                                    variant="secondary"
                                    icon={requireAssetIndex("MoreHorizontalIcon")}
                                />
                                <TableSwitch
                                    value={plugin.enabled}
                                    onValueChange={(v: boolean) => {
                                        if (v) startPlugin(plugin.id);
                                        else stopPlugin(plugin.id);
                                    }}
                                />
                            </Stack>
                        </View>
                    </View>
                    <Text variant="text-md/medium">
                        {plugin.manifest.description}
                    </Text>
                </Stack>
            </Card>
        </PluginContext.Provider>
    );
}
