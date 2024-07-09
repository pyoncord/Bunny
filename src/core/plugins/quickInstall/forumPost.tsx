import { Strings } from "@core/i18n";
import { findAssetId } from "@lib/api/assets";
import { isThemeSupported } from "@lib/api/native/loader";
import { after } from "@lib/api/patcher";
import { useProxy } from "@lib/api/storage";
import { installPlugin, removePlugin,sourceStore } from "@lib/managers/plugins";
import { installTheme, removeTheme, themes } from "@lib/managers/themes";
import { DISCORD_SERVER_ID, HTTP_REGEX_MULTI, PLUGINS_CHANNEL_ID, THEMES_CHANNEL_ID, VD_PROXY_PREFIX } from "@lib/utils/constants";
import { lazyDestructure } from "@lib/utils/lazy";
import { Button } from "@metro/common/components";
import { findByProps, findByPropsProxy } from "@metro/utils";
import { ErrorBoundary } from "@ui/components";
import { showToast } from "@ui/toasts";

type PostType = "Plugin" | "Theme";

// const ForumPostLongPressActionSheet = findByNameProxy("ForumPostLongPressActionSheet", false);
// const { ActionSheetRow } = findByPropsProxy("ActionSheetRow");
const { useFirstForumPostMessage } = lazyDestructure(() => findByProps("useFirstForumPostMessage"));
const forumReactions = findByPropsProxy("MostCommonForumPostReaction");

const postMap = {
    Plugin: {
        storage: sourceStore,
        urlsFilter: (url: string) => url.startsWith(VD_PROXY_PREFIX),
        installOrRemove: (url: string) => {
            const isInstalled = postMap.Plugin.storage[url];
            return isInstalled ? removePlugin(url) : installPlugin(url);
        }
    },
    Theme: {
        storage: themes,
        urlsFilter: (url: string) => url.endsWith(".json"),
        installOrRemove: (url: string) => {
            const isInstalled = postMap.Theme.storage[url];
            return isInstalled ? removeTheme(url) : installTheme(url);
        },
    }
};

function useExtractThreadContent(thread: any, _firstMessage = null, actionSheet = false): ([PostType, string]) | void {
    if (thread.guild_id !== DISCORD_SERVER_ID) return;

    // Determine what type of addon this is.
    let postType: PostType;
    if (thread.parent_id === PLUGINS_CHANNEL_ID) {
        postType = "Plugin";
    } else if (thread.parent_id === THEMES_CHANNEL_ID && isThemeSupported()) {
        postType = "Theme";
    } else return;

    const { firstMessage } = actionSheet ? useFirstForumPostMessage(thread) : { firstMessage: _firstMessage };

    const urls = firstMessage?.content?.match(HTTP_REGEX_MULTI)?.filter(postMap[postType].urlsFilter);
    if (!urls || !urls[0]) return;

    // Sync with lib/managers/plugins
    if (postType === "Plugin" && !urls[0].endsWith("/")) urls[0] += "/";

    return [postType, urls[0]];
}

function useInstaller(thread: any, firstMessage = null, actionSheet = false): [true] | [false, PostType, boolean, boolean, () => Promise<void>] {
    const [postType, url] = useExtractThreadContent(thread, firstMessage, actionSheet) ?? [];

    useProxy(sourceStore);
    useProxy(themes);

    const [isInstalling, setIsInstalling] = React.useState(false);

    if (!postType || !url) return [true];

    const isInstalled = Boolean(postMap[postType].storage[url]);

    const installOrRemove = async () => {
        setIsInstalling(true);
        try {
            await postMap[postType].installOrRemove(url);
        } catch (e: any) {
            showToast(e.message, findAssetId("Small"));
        } finally {
            setIsInstalling(false);
        }
    };

    return [false, postType, isInstalled, isInstalling, installOrRemove];
}

// // apparently broken???
// const actionSheetPatch = () => after("default", ForumPostLongPressActionSheet, ([{ thread }], res) => {
//     const [shouldReturn, postType, installed, loading, installOrRemove] = useInstaller(thread);
//     if (shouldReturn) return;

//     const actions = findInReactTree(res, t => t?.[0]?.key);
//     const ActionsSection = actions[0].type;

//     actions.unshift(<ActionsSection key="install">
//         <ActionSheetRow
//             icon={<ActionSheetRow.Icon source={getAssetIDByName(installed ? "ic_message_delete" : "DownloadIcon")} />}
//             label={formatString(installed ? "UNINSTALL_TITLE" : "INSTALL_TITLE", { title: postType })}
//             disabled={loading}
//             onPress={installOrRemove}
//         />
//     </ActionsSection>);
// });

const installButtonPatch = () => after("MostCommonForumPostReaction", forumReactions, ([{ thread, firstMessage }], res) => {
    const [shouldReturn, _, installed, loading, installOrRemove] = useInstaller(thread, firstMessage, true);
    if (shouldReturn) return;

    return <>
        {res}
        <ErrorBoundary>
            <Button
                size="sm"
                loading={loading}
                disabled={loading}
                // variant={installed ? "destructive" : "primary"} crashes older version because "destructive" was renamed from "danger" and there's no sane way for compat check horror
                variant={installed ? "secondary" : "primary"}
                text={installed ? Strings.UNINSTALL : Strings.INSTALL}
                onPress={installOrRemove}
                icon={findAssetId(installed ? "ic_message_delete" : "DownloadIcon")}
                style={{ marginLeft: 8 }}
            />
        </ErrorBoundary>
    </>;
});

export default () => {
    const patches = [
        // actionSheetPatch(),
        installButtonPatch()
    ];

    return () => patches.map(p => p());
};
