import { CardWrapper } from "@core/ui/components/AddonCard";
import { requireAssetIndex } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { BunnyPlugin, getSettings, startPlugin, stopPlugin } from "@lib/managers/plugins";
import { showSheet } from "@lib/ui/sheets";
import { lazyDestructure } from "@lib/utils/lazy";
import { findByProps } from "@metro";
import { NavigationNative, tokens } from "@metro/common";
import { Card, PressableScale, Stack, TableSwitch, Text } from "@metro/common/components";
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

    const iconName = plugin.manifest.vendetta?.icon;
    const icon = iconName && requireAssetIndex(iconName);

    return <Text
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        variant="heading-md/semibold"
    >
        {icon && <>
            <Image
                style={styles.pluginIcon}
                source={icon}
            />
            {" "}
        </>}
        {plugin.manifest.name}
    </Text>;
}

// TODO: Wrap in a Card-ish component with red bg
// TODO: Allow glacing at the error's stack
function Status() {
    const plugin = usePlugin();
    const styles = usePluginCardStyles();
    const INTERACTIVE_NORMAL = useToken(tokens.colors.INTERACTIVE_NORMAL);

    if (!plugin.error) return null;

    return <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={styles.actionIcon}>
            <Image
                tintColor={INTERACTIVE_NORMAL}
                source={requireAssetIndex("WarningIcon")}
            />
        </View>
        <Text variant="text-sm/semibold">
            There was an error while attempting to start this plugin.
        </Text>
    </View>;
}

function ActionIcon(props: {
    onPress: () => void;
    icon: string;
    disabled?: boolean;
}) {
    const styles = usePluginCardStyles();

    return <View style={props.disabled && { opacity: 0.4, pointerEvents: "none" }}>
        <PressableScale onPress={() => !props.disabled && props.onPress()}>
            <View style={styles.actionIconContainer}>
                <Image
                    source={requireAssetIndex(props.icon)}
                    style={styles.actionIcon}
                />
            </View>
        </PressableScale>
    </View>;
}

export default function PluginCard({ item: plugin }: CardWrapper<BunnyPlugin>) {
    const navigation = NavigationNative.useNavigation();
    const styles = usePluginCardStyles();

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
                                <View style={{ flexDirection: "row", gap: 6 }}>
                                    <ActionIcon
                                        icon="WrenchIcon"
                                        disabled={!getSettings(plugin.id)}
                                        onPress={() => navigation.push("VendettaCustomPage", {
                                            title: plugin.manifest.name,
                                            render: getSettings(plugin.id),
                                        })}
                                    />
                                    <ActionIcon
                                        icon="CircleInformationIcon-primary"
                                        onPress={() => void showSheet(
                                            "PluginInfoActionSheet",
                                            import("./sheets/PluginInfoActionSheet"),
                                            { plugin, navigation }
                                        )}
                                    />
                                </View>
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
