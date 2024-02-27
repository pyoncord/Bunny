import { NavigationNative, clipboard } from "@metro/common";
import { removePlugin, startPlugin, stopPlugin, getSettings, fetchPlugin, BunnyPlugin } from "@lib/plugins";
import { MMKVManager } from "@lib/native/modules";
import { getAssetIDByName } from "@ui/assets";
import { showToast } from "@ui/toasts";
import { showConfirmationAlert } from "@ui/alerts";
import Card, { CardWrapper } from "@ui/settings/components/Card";
import { useProxy } from "@/lib/storage";
import { ButtonColors } from "@/lib/types";
import { Strings, formatString } from "@/lib/i18n";

async function stopThenStart(plugin: BunnyPlugin, callback: Function) {
    if (plugin.enabled) stopPlugin(plugin.id, false);
    callback();
    if (plugin.enabled) await startPlugin(plugin.id);
}

export default function PluginCard({ item: plugin, index }: CardWrapper<BunnyPlugin>) {
    useProxy(plugin);

    const settings = getSettings(plugin.id);
    const navigation = NavigationNative.useNavigation();
    const [removed, setRemoved] = React.useState(false);

    // This is needed because of React™
    if (removed) return null;

    return (
        <Card
            index={index}
            // TODO: Actually make use of user IDs
            headerLabel={`${plugin.manifest.name} by ${plugin.manifest.authors.map(i => i.name).join(", ")}`}
            headerIcon={plugin.manifest.vendetta?.icon || "ic_application_command_24px"}
            toggleType="switch"
            toggleValue={plugin.enabled}
            onToggleChange={(v: boolean) => {
                try {
                    if (v) startPlugin(plugin.id); else stopPlugin(plugin.id);
                } catch (e) {
                    showToast((e as Error).message, getAssetIDByName("Small"));
                }
            }}
            descriptionLabel={plugin.manifest.description}
            overflowTitle={plugin.manifest.name}
            overflowActions={[
                ...(settings ? [{
                    label: Strings.OVERFLOW_PLUGIN_SETTINGS,
                    icon: "settings",
                    onPress: () => navigation.push("VendettaCustomPage", {
                        title: plugin.manifest.name,
                        render: settings,
                    })
                }] : []),
                {
                    icon: "ic_sync_24px",
                    label: Strings.REFETCH,
                    onPress: async () => {
                        stopThenStart(plugin, () => {
                            fetchPlugin(plugin.id).then(async () => {
                                showToast("Successfully refetched plugin.", getAssetIDByName("toast_image_saved"));
                            }).catch(() => {
                                showToast("Failed to refetch plugin!", getAssetIDByName("Small"));
                            })
                        });
                    },
                },
                {
                    icon: "copy",
                    label: Strings.COPY_URL,
                    onPress: () => {
                        clipboard.setString(plugin.id);
                        showToast.showCopyToClipboard();
                    }
                },
                {   
                    icon: "ic_download_24px",
                    label: plugin.update ? Strings.DISABLE_UPDATES : Strings.ENABLE_UPDATES,
                    onPress: () => {
                        plugin.update = !plugin.update;
                        showToast(`${plugin.update ? "Enabled" : "Disabled"} updates for ${plugin.manifest.name}.`, getAssetIDByName("toast_image_saved"));
                    }
                },
                {
                    icon: "ic_duplicate",
                    label: Strings.CLEAR_DATA,
                    isDestructive: true,
                    onPress: () => showConfirmationAlert({
                        title: Strings.HOLD_UP,
                        content: formatString("ARE_YOU_SURE_TO_CLEAR_DATA", { name: plugin.manifest.name }),
                        confirmText: Strings.CLEAR,
                        cancelText: Strings.CANCEL,
                        confirmColor: ButtonColors.RED,
                        onConfirm: () => {
                            stopThenStart(plugin, () => {
                                try {
                                    MMKVManager.removeItem(plugin.id);
                                    showToast(formatString("CLEAR_DATA_SUCCESSFUL", { name: plugin.manifest.name }), getAssetIDByName("trash"));
                                } catch {
                                    showToast(formatString("CLEAR_DATA_FAILED", { name: plugin.manifest.name }), getAssetIDByName("Small"));
                                }
                            });
                        }
                    }),
                },
                {
                    icon: "ic_message_delete",
                    label: Strings.DELETE,
                    isDestructive: true,
                    onPress: () => showConfirmationAlert({
                        title: Strings.HOLD_UP,
                        content: formatString("ARE_YOU_SURE_TO_DELETE_PLUGIN", {name: plugin.manifest.name}),
                        confirmText: Strings.DELETE,
                        cancelText: Strings.CANCEL,
                        confirmColor: ButtonColors.RED,
                        onConfirm: () => {
                            try {
                                removePlugin(plugin.id);
                                setRemoved(true);
                            } catch (e) {
                                showToast((e as Error).message, getAssetIDByName("Small"));
                            }
                        }
                    }),
                }
            ]}
        />
    )
}
