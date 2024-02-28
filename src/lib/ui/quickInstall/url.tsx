import { findByProps, find } from "@metro/filters";
import { ReactNative as RN, channels, url } from "@metro/common";
import { PROXY_PREFIX, THEMES_CHANNEL_ID } from "@lib/utils/constants";
import { after, instead } from "@lib/api/patcher";
import { installPlugin } from "@lib/managers/plugins";
import { installTheme } from "@lib/managers/themes";
import { showConfirmationAlert } from "@ui/alerts";
import { getAssetIDByName } from "@/lib/api/assets";
import { showToast } from "@ui/toasts";
import { isThemeSupported } from "@/lib/api/native/loader";
import { Strings, formatString, formatStringSplit } from "@/core/i18n";

const showSimpleActionSheet = find((m) => m?.showSimpleActionSheet && !Object.getOwnPropertyDescriptor(m, "showSimpleActionSheet")?.get);
const handleClick = findByProps("handleClick");
const { openURL } = url;
const { getChannelId } = channels;
const { getChannel } = findByProps("getChannel");

const { TextStyleSheet } = findByProps("TextStyleSheet");

function typeFromUrl(url: string) {
    if (url.startsWith(PROXY_PREFIX)) {
        return "Plugin";
    } else if (url.endsWith(".json") && isThemeSupported()) {
        return "Theme";
    } else return;
}

function installWithToast(type: "Plugin" | "Theme", url: string) {
    (type === "Plugin" ? installPlugin : installTheme)(url)
        .then(() => {
            showToast(Strings.TOASTS_SUCCESSFULLY_INSTALLED, getAssetIDByName("Check"));
        })
        .catch((e: Error) => {
            showToast(e.message, getAssetIDByName("Small"));
        });
}

export default () => {
    const patches = new Array<Function>();

    patches.push(
        after("showSimpleActionSheet", showSimpleActionSheet, (args) => {
            if (args[0].key !== "LongPressUrl") return;
            const {
                header: { title: url },
                options,
            } = args[0];

            const urlType = typeFromUrl(url);
            if (!urlType) return;

            options.push({
                label: formatString("INSTALL_TITLE", { urlType }),
                onPress: () => installWithToast(urlType, url),
            });
        })
    );

    patches.push(
        instead("handleClick", handleClick, async function (this: any, args, orig) {
            const { href: url } = args[0];

            const urlType = typeFromUrl(url);
            if (!urlType) return orig.apply(this, args);

            // Make clicking on theme links only work in #themes, should there be a theme proxy in the future, this can be removed.
            if (urlType === "Theme" && getChannel(getChannelId())?.parent_id !== THEMES_CHANNEL_ID) return orig.apply(this, args);

            showConfirmationAlert({
                title: Strings.HOLD_UP,
                content: formatStringSplit("CONFIRMATION_LINK_IS_A_TYPE", { urlType: <RN.Text style={TextStyleSheet["text-md/semibold"]}>{urlType}</RN.Text> }),
                onConfirm: () => installWithToast(urlType, url),
                confirmText: Strings.INSTALL,
                cancelText: Strings.CANCEL,
                secondaryConfirmText: Strings.OPEN_IN_BROWSER,
                onConfirmSecondary: () => openURL(url),
            });
        })
    );

    return () => patches.forEach((p) => p());
};
