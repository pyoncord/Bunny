import { formatString, Strings } from "@core/i18n";
import { VdPluginManager, VendettaPlugin } from "@core/vendetta/plugins";
import { findAssetId } from "@lib/api/assets";
import { purgeStorage, useProxy } from "@lib/api/storage";
import { ButtonColors } from "@lib/utils/types";
import { clipboard } from "@metro/common";
import { ActionSheet, ActionSheetRow, Button, TableRow, Text } from "@metro/common/components";
import { showConfirmationAlert } from "@ui/alerts";
import { hideSheet } from "@ui/sheets";
import { showToast } from "@ui/toasts";
import { ScrollView, View } from "react-native";

interface InfoProps {
    plugin: VendettaPlugin;
    navigation: any;
}

export default function PluginInfoActionSheet({ plugin, navigation }: InfoProps) {
    useProxy(plugin);

    const Settings = VdPluginManager.getSettings(plugin.id);

    return <ActionSheet>
        <ScrollView>
            <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 24 }}>
                <Text variant="heading-xl/semibold">
                    {plugin.manifest.name}
                </Text>
                <View style={{ marginLeft: "auto" }}>
                    {Settings && <Button
                        size="md"
                        text="Configure"
                        variant="secondary"
                        icon={findAssetId("WrenchIcon")}
                        onPress={() => {
                            hideSheet("PluginInfoActionSheet");
                            navigation.push("VendettaCustomPage", {
                                title: plugin.manifest.name,
                                render: Settings,
                            });
                        }}
                    />}
                </View>
            </View>
            <ActionSheetRow.Group>
                <ActionSheetRow
                    label={Strings.REFETCH}
                    icon={<TableRow.Icon source={findAssetId("RetryIcon")} />}
                    onPress={async () => {
                        if (plugin.enabled) VdPluginManager.stopPlugin(plugin.id, false);

                        try {
                            await VdPluginManager.fetchPlugin(plugin.id);
                            showToast(Strings.PLUGIN_REFETCH_SUCCESSFUL, findAssetId("toast_image_saved"));
                        } catch {
                            showToast(Strings.PLUGIN_REFETCH_FAILED, findAssetId("Small"));
                        }

                        if (plugin.enabled) await VdPluginManager.startPlugin(plugin.id);
                        hideSheet("PluginInfoActionSheet");
                    }}
                />
                <ActionSheetRow
                    label={Strings.COPY_URL}
                    icon={<TableRow.Icon source={findAssetId("copy")} />}
                    onPress={() => {
                        clipboard.setString(plugin.id);
                        showToast.showCopyToClipboard();
                    }}
                />
                <ActionSheetRow
                    label={plugin.update ? Strings.DISABLE_UPDATES : Strings.ENABLE_UPDATES}
                    icon={<TableRow.Icon source={findAssetId("ic_download_24px")} />}
                    onPress={() => {
                        plugin.update = !plugin.update;
                        showToast(formatString("TOASTS_PLUGIN_UPDATE", {
                            update: plugin.update,
                            name: plugin.manifest.name
                        }), findAssetId("toast_image_saved"));
                    }}
                />
                <ActionSheetRow
                    label={Strings.CLEAR_DATA}
                    icon={<TableRow.Icon source={findAssetId("ic_duplicate")} />}
                    onPress={() => showConfirmationAlert({
                        title: Strings.HOLD_UP,
                        content: formatString("ARE_YOU_SURE_TO_CLEAR_DATA", { name: plugin.manifest.name }),
                        confirmText: Strings.CLEAR,
                        cancelText: Strings.CANCEL,
                        confirmColor: ButtonColors.RED,
                        onConfirm: async () => {
                            if (plugin.enabled) VdPluginManager.stopPlugin(plugin.id, false);

                            try {
                                await VdPluginManager.fetchPlugin(plugin.id);
                                showToast(Strings.PLUGIN_REFETCH_SUCCESSFUL, findAssetId("toast_image_saved"));
                            } catch {
                                showToast(Strings.PLUGIN_REFETCH_FAILED, findAssetId("Small"));
                            }

                            let message: any[];
                            try {
                                purgeStorage(plugin.id);
                                message = ["CLEAR_DATA_SUCCESSFUL", "trash"];
                            } catch {
                                message = ["CLEAR_DATA_FAILED", "Small"];
                            }

                            showToast(
                                formatString(message[0], { name: plugin.manifest.name }),
                                findAssetId(message[1])
                            );

                            if (plugin.enabled) await VdPluginManager.startPlugin(plugin.id);
                            hideSheet("PluginInfoActionSheet");
                        }
                    })}
                />
                <ActionSheetRow
                    label={Strings.DELETE}
                    icon={<TableRow.Icon source={findAssetId("ic_message_delete")} />}
                    onPress={() => showConfirmationAlert({
                        title: Strings.HOLD_UP,
                        content: formatString("ARE_YOU_SURE_TO_DELETE_PLUGIN", { name: plugin.manifest.name }),
                        confirmText: Strings.DELETE,
                        cancelText: Strings.CANCEL,
                        confirmColor: ButtonColors.RED,
                        onConfirm: () => {
                            try {
                                VdPluginManager.removePlugin(plugin.id);
                            } catch (e) {
                                showToast(String(e), findAssetId("Small"));
                            }
                            hideSheet("PluginInfoActionSheet");
                        }
                    })}
                />
            </ActionSheetRow.Group>
        </ScrollView>
    </ActionSheet>;
}
