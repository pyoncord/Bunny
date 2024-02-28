import { clipboard } from "@metro/common";
import { Theme, applyTheme, fetchTheme, removeTheme, selectTheme, themes } from "@lib/managers/themes";
import { useProxy } from "@/lib/api/storage";
import { BundleUpdaterManager } from "@lib/api/native/modules";
import { getAssetIDByName } from "@/lib/api/assets";
import { showConfirmationAlert } from "@ui/alerts";
import { showToast } from "@ui/toasts";
import { settings } from "@lib/settings";
import Card, { CardWrapper } from "@ui/settings/components/Card";
import { ButtonColors } from "@/lib/utils/types";
import { Strings, formatString } from "@/core/i18n";

async function selectAndApply(value: boolean, id: string) {
    try {
        await selectTheme(value ? id : "default");
        value ? applyTheme(themes[id]) : applyTheme(null);

        // TODO: Implement native side reload-less & check if it's applied by 100%
        showToast(Strings.THEMES_RELOAD_FOR_CHANGES, getAssetIDByName("yellow-alert"));
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
                    label: Strings.REFETCH,
                    onPress: () => {
                        fetchTheme(theme.id, theme.selected).then(() => {
                            if (theme.selected) {
                                showConfirmationAlert({
                                    title: Strings.MODAL_THEME_REFETCHED,
                                    content: Strings.MODAL_THEME_REFETCHED_DESC,
                                    confirmText: Strings.RELOAD,
                                    cancelText: Strings.CANCEL,
                                    confirmColor: ButtonColors.RED,
                                    onConfirm: () => BundleUpdaterManager.reload(),
                                })
                            } else {
                                showToast(Strings.THEME_REFETCH_SUCCESSFUL, getAssetIDByName("toast_image_saved"));
                            }
                        }).catch(() => {
                            showToast(Strings.THEME_REFETCH_FAILED, getAssetIDByName("Small"));
                        });
                    },
                },
                {
                    icon: "copy",
                    label: Strings.COPY_URL,
                    onPress: () => {
                        clipboard.setString(theme.id);
                        showToast.showCopyToClipboard();
                    }
                },
                {
                    icon: "ic_message_delete",
                    label: Strings.DELETE,
                    isDestructive: true,
                    onPress: () => showConfirmationAlert({
                        title: Strings.HOLD_UP,
                        content: formatString("ARE_YOU_SURE_TO_DELETE_THEME", { name: theme.data.name }),
                        confirmText: Strings.DELETE,
                        cancelText: Strings.CANCEL,
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
