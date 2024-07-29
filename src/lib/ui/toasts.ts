import { Strings } from "@core/i18n";
import { findAssetId } from "@lib/api/assets";
import { lazyDestructure } from "@lib/utils/lazy";
import { toasts } from "@metro/common";
import { findByProps } from "@metro/wrappers";

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
    showToast(message, findAssetId("toast_copy_link"));
};
