import { formatString, Strings } from "@core/i18n";
import { requireAssetIndex } from "@lib/api/assets";
import { isThemeSupported } from "@lib/api/native/loader";
import { after, instead } from "@lib/api/patcher";
import { installPlugin } from "@lib/managers/plugins";
import { installTheme } from "@lib/managers/themes";
import { THEMES_CHANNEL_ID, VD_PROXY_PREFIX } from "@lib/utils/constants";
import { lazyDestructure } from "@lib/utils/lazy";
import { channels, url } from "@metro/common";
import { byMutableProp } from "@metro/filters";
import { findExports } from "@metro/finders";
import { findByProps, findByPropsProxy } from "@metro/utils";
import { showConfirmationAlert } from "@ui/alerts";
import { showToast } from "@ui/toasts";

const showSimpleActionSheet = findExports(byMutableProp("showSimpleActionSheet"));
const handleClick = findByPropsProxy("handleClick");
const { openURL } = lazyDestructure(() => url);
const { getChannelId } = lazyDestructure(() => channels);
const { getChannel } = lazyDestructure(() => findByProps("getChannel"));

function typeFromUrl(url: string) {
    if (url.startsWith(VD_PROXY_PREFIX)) {
        return "plugin";
    } else if (url.endsWith(".json") && isThemeSupported()) {
        return "theme";
    }
}

function installWithToast(type: "plugin" | "theme", url: string) {
    (type === "plugin" ? installPlugin : installTheme)(url)
        .then(() => {
            showToast(Strings.SUCCESSFULLY_INSTALLED, requireAssetIndex("Check"));
        })
        .catch((e: Error) => {
            showToast(e.message, requireAssetIndex("Small"));
        });
}

export default () => {
    const patches = new Array<Function>();

    patches.push(
        after("showSimpleActionSheet", showSimpleActionSheet, args => {
            if (args[0].key !== "LongPressUrl") return;
            const {
                header: { title: url },
                options,
            } = args[0];

            const urlType = typeFromUrl(url);
            if (!urlType) return;

            options.push({
                label: Strings.INSTALL_ADDON,
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
            if (urlType === "theme" && getChannel(getChannelId())?.parent_id !== THEMES_CHANNEL_ID) return orig.apply(this, args);

            showConfirmationAlert({
                title: Strings.HOLD_UP,
                content: formatString("CONFIRMATION_LINK_IS_A_TYPE", { urlType }),
                onConfirm: () => installWithToast(urlType, url),
                confirmText: Strings.INSTALL,
                cancelText: Strings.CANCEL,
                secondaryConfirmText: Strings.OPEN_IN_BROWSER,
                onConfirmSecondary: () => openURL(url),
            });
        })
    );

    return () => patches.forEach(p => p());
};
