import { Strings } from "@core/i18n";
import { getAssetIDByName } from "@lib/api/assets";
import { lazyDestructure } from "@lib/utils/lazy";
import { toasts } from "@metro/common";
import { findByProps } from "@metro/utils";
import { Platform } from "react-native";

const { uuid4 } = lazyDestructure(() => findByProps("uuid4"));

export const showToast = (content: string, asset?: number) => toasts.open({
    // ? In build 182205/44707, Discord changed their toasts, source is no longer used, rather icon, and a key is needed.
    // TODO: We could probably have the developer specify a key themselves, but this works to fix toasts
    key: `vd-toast-${uuid4()}`,
    content: content,
    source: asset,
    icon: asset,
});

showToast.showCopyToClipboard = (message = Strings.COPIED_TO_CLIPBOARD) => {
    // On Android, only show toast for 12 and lower
    if (Platform.OS !== "android" || Platform.Version <= 32) {
        showToast(message, getAssetIDByName("toast_copy_link"));
    }
};
