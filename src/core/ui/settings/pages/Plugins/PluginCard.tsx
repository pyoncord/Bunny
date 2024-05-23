import { CardWrapper } from "@core/ui/components/AddonCard";
import { requireAssetIndex } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { BunnyPlugin, startPlugin, stopPlugin } from "@lib/managers/plugins";
import { Button, Card, IconButton, Stack, Text } from "@metro/common/components";
import { createContext, useContext, useState } from "react";
import { Image, View } from "react-native";

import { usePluginCardStyles } from "./usePluginCardStyles";

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

function Toggle() {
    const plugin = usePlugin();
    const [loading, setLoading] = useState(false);

    const wrap = (promise: any) => {
        setLoading(true);
        Promise.resolve(promise).finally(() => setLoading(false));
    };

    return <Button
        size="sm"
        text={plugin.enabled ? "Disable" : "Enable"}
        variant={plugin.enabled ? "secondary" : "primary"}
        loading={loading}
        disabled={loading}
        onPress={() => {
            if (plugin.enabled) wrap(stopPlugin(plugin.id));
            else wrap(startPlugin(plugin.id));
        }}
    />;
}

export default function PluginCard({ item: plugin }: CardWrapper<BunnyPlugin>) {
    useProxy(plugin);

    return (
        <PluginContext.Provider value={plugin}>
            <Card>
                <Stack spacing={16}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Stack spacing={0}>
                            <Title />
                            <Authors />
                        </Stack>
                        <View style={{ marginLeft: "auto" }}>
                            <Stack spacing={12} direction="horizontal">
                                <IconButton
                                    onPress={() => { }}
                                    size="sm"
                                    variant="secondary"
                                    icon={requireAssetIndex("SettingsIcon")}
                                />
                                <Toggle />
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
