import { findAssetId } from "@lib/api/assets";
import { hideSheet } from "@lib/ui/sheets";
import { ActionSheet, Button, Text } from "@metro/common/components";
import { ScrollView, View } from "react-native";

import { PluginInfoActionSheetProps } from "./common";

export default function PluginInfoActionSheet({ plugin, navigation }: PluginInfoActionSheetProps) {
    plugin.usePluginState();

    return <ActionSheet>
        <ScrollView>
            <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 24 }}>
                <Text variant="heading-xl/semibold">
                    {plugin.name}
                </Text>
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
        </ScrollView>
    </ActionSheet>;
}
