import { ButtonColors, Theme } from "@types";
import { clipboard } from "@metro/common";
import { applyTheme, fetchTheme, removeTheme, selectTheme, themes } from "@lib/themes";
import { useProxy } from "@lib/storage";
import { BundleUpdaterManager } from "@lib/native";
import { getAssetIDByName } from "@ui/assets";
import { showConfirmationAlert } from "@ui/alerts";
import { showToast } from "@ui/toasts";
import settings from "@lib/settings";
import Card, { CardWrapper } from "@ui/settings/components/Card";

async function selectAndApply(value: boolean, id: string) {
    try {
        await selectTheme(value ? id : "default");
        value ? applyTheme(themes[id]) : applyTheme(null);

        // TODO: Implement native side reload-less & check if it's applied by 100%
        showToast("Reload the app to fully apply changes!", getAssetIDByName("yellow-alert"));
    } catch (e: any) {
        console.error("Error while selectAndApply,", e)
    } 
}

export default function ThemeCard({ item: theme, index }: CardWrapper<Theme>) {
    useProxy(theme);

    const [removed, setRemoved] = React.useState(false);

    // This is needed because of React™
    if (removed) return null;

    const authors = theme.data.authors;

    return (
        <Card
            index={index}
            headerLabel={`${theme.data.name} ${authors ? `by ${authors.map(i => i.name).join(", ")}` : ""}`}
            descriptionLabel={theme.data.description ?? "No description."}
            toggleType={!settings.safeMode?.enabled ? "radio" : undefined}
            toggleValue={theme.selected}
            onToggleChange={(v: boolean) => {
                selectAndApply(v, theme.id);
            }}
            overflowTitle={theme.data.name}
            overflowActions={[
                {
                    icon: "ic_sync_24px",
                    label: "Refetch",
                    onPress: () => {
                        fetchTheme(theme.id, theme.selected).then(() => {
                            if (theme.selected) {
                                showConfirmationAlert({
                                    title: "Theme refetched",
                                    content: "A reload is required to see the changes. Do you want to reload now?",
                                    confirmText: "Reload",
                                    cancelText: "Cancel",
                                    confirmColor: ButtonColors.RED,
                                    onConfirm: () => BundleUpdaterManager.reload(),
                                })
                            } else {
                                showToast("Successfully refetched theme.", getAssetIDByName("toast_image_saved"));
                            }
                        }).catch(() => {
                            showToast("Failed to refetch theme!", getAssetIDByName("Small"));
                        });
                    },
                },
                {
                    icon: "copy",
                    label: "Copy URL",
                    onPress: () => {
                        clipboard.setString(theme.id);
                        showToast.showCopyToClipboard();
                    }
                },
                {
                    icon: "ic_message_delete",
                    label: "Delete",
                    isDestructive: true,
                    onPress: () => showConfirmationAlert({
                        title: "Wait!",
                        content: `Are you sure you wish to delete ${theme.data.name}?`,
                        confirmText: "Delete",
                        cancelText: "Cancel",
                        confirmColor: ButtonColors.RED,
                        onConfirm: () => {
                            removeTheme(theme.id).then((wasSelected) => {
                                setRemoved(true);
                                if (wasSelected) selectAndApply(false, theme.id);
                            }).catch((e: Error) => {
                                showToast(e.message, getAssetIDByName("Small"));
                            });
                        }
                    })
                },
            ]}
        />
    )
}
