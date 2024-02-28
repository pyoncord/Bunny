import { findByProps } from "@metro/filters";
import { ReactNative, toasts } from "@metro/common";
import { getAssetIDByName } from "@/lib/api/assets";

const { uuid4 } = findByProps("uuid4");

export const showToast = (content: string, asset?: number) => toasts.open({
    //? In build 182205/44707, Discord changed their toasts, source is no longer used, rather icon, and a key is needed.
    // TODO: We could probably have the developer specify a key themselves, but this works to fix toasts
    key: `vd-toast-${uuid4()}`,
    content: content,
    source: asset,
    icon: asset,
});

showToast.showCopyToClipboard = (message = "Copied plugin URL to clipboard.") => {
    // On Android, only show toast for 12 and lower
    if (ReactNative.Platform.OS !== "android" || ReactNative.Platform.Version <= 32) {
        showToast(message, getAssetIDByName("toast_copy_link"));
    }
}