import { findAssetId } from "@lib/api/assets";
import { hideSheet } from "@lib/ui/sheets";
import { ActionSheet, Button, Text } from "@metro/common/components";
import { ScrollView, View } from "react-native";

import { PluginInfoActionSheetProps } from "./common";

export default function PluginInfoActionSheet({ plugin, navigation }: PluginInfoActionSheetProps) {
    plugin.usePluginState();

    return <ActionSheet>
        <ScrollView contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 24 }}>
                <View style={{ gap: 4 }}>
                    <Text variant="heading-xl/semibold">
                        {plugin.name}
                    </Text>
                    <Text variant="text-md/medium" color="text-muted">
                        {plugin.description}
                    </Text>
                </View>
                <View style={{ marginLeft: "auto" }}>
                    {plugin.getPluginSettingsComponent() && <Button
                        size="md"
                        text="Configure"
                        variant="secondary"
                        icon={findAssetId("WrenchIcon")}
                        onPress={() => {
                            hideSheet("PluginInfoActionSheet");
                            navigation.push("BUNNY_CUSTOM_PAGE", {
                                title: plugin.name,
                                render: plugin.getPluginSettingsComponent(),
                            });
                        }}
                    />}
                </View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "center", alignContent: "center" }}>
                <Text variant="text-lg/medium">
                    Oops, you shouldn't see this!
                </Text>
            </View>
        </ScrollView>
    </ActionSheet>;
}
