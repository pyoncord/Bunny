import { findByName, findByProps } from "@metro/filters";
import { DISCORD_SERVER_ID, PLUGINS_CHANNEL_ID, THEMES_CHANNEL_ID, HTTP_REGEX_MULTI, PROXY_PREFIX } from "@lib/constants";
import { after } from "@lib/patcher";
import { installPlugin, plugins, removePlugin } from "@lib/plugins";
import { installTheme, removeTheme, themes } from "@lib/themes";
import { findInReactTree } from "@lib/utils";
import { getAssetIDByName } from "@ui/assets";
import { showToast } from "@ui/toasts";
import { useProxy } from "@/lib/storage";
import { isThemeSupported } from "@/lib/loader";

type PostType = "Plugin" | "Theme";

const ForumPostLongPressActionSheet = findByName("ForumPostLongPressActionSheet", false);
const { ActionSheetRow } = findByProps("ActionSheetRow");
const { Button } = findByProps("TableRow");
const { useFirstForumPostMessage } = findByProps("useFirstForumPostMessage");
const forumReactions = findByProps("MostCommonForumPostReaction");

const postMap = {
    Plugin: {
        storage: plugins,
        urlsFilter: (url: string) => url.startsWith(PROXY_PREFIX),
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
}

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

    let urls = firstMessage?.content?.match(HTTP_REGEX_MULTI)?.filter(postMap[postType].urlsFilter);
    if (!urls || !urls[0]) return;

    // Sync with lib/plugins
    if (postType === "Plugin" && !urls[0].endsWith("/")) urls[0] += "/";

    return [postType, urls[0]];
}

function useInstaller(thread: any, firstMessage = null, actionSheet = false): [true] | [false, PostType, boolean, boolean, () => Promise<void>] {
    const [postType, url] = useExtractThreadContent(thread, firstMessage, actionSheet) ?? [];

    useProxy(plugins);
    useProxy(themes);

    const [isInstalling, setIsInstalling] = React.useState(false);

    if (!postType || !url) return [true];

    const isInstalled = Boolean(postMap[postType].storage[url]);

    const installOrRemove = async () => {
        setIsInstalling(true);
        try {
            await postMap[postType].installOrRemove(url);
        } catch (e: any) {
            showToast(e.message, getAssetIDByName("Small"));
        } finally {
            setIsInstalling(false);
        }
    };

    return [false, postType, isInstalled, isInstalling, installOrRemove]
}

const actionSheetPatch = () => after("default", ForumPostLongPressActionSheet, ([{ thread }], res) => {
    const [shouldReturn, postType, installed, loading, installOrRemove] = useInstaller(thread);
    if (shouldReturn) return;

    const actions = findInReactTree(res, (t) => t?.[0]?.key);
    const ActionsSection = actions[0].type;

    actions.unshift(<ActionsSection key="install">
        <ActionSheetRow
            icon={<ActionSheetRow.Icon source={getAssetIDByName(installed ? "ic_message_delete" : "DownloadIcon")} />}
            label={`${installed ? "Uninstall" : "Install"} ${postType}`}
            disabled={loading}
            onPress={installOrRemove}
        />
    </ActionsSection>);
});

const installButtonPatch = () => after("MostCommonForumPostReaction", forumReactions, ([{ thread, firstMessage }], res) => {
    const [shouldReturn, _, installed, loading, installOrRemove] = useInstaller(thread, firstMessage, true);
    if (shouldReturn) return;

    return <>
        {res}
        <Button
            size="sm"
            loading={loading}
            disabled={loading}
            variant={installed ? "danger" : "primary"}
            text={installed ? "Uninstall" : "Install"}
            onPress={installOrRemove}
            icon={getAssetIDByName(installed ? "ic_message_delete" : "DownloadIcon")}
            style={{ marginLeft: 8 }}
        />
    </>
});

export default () => {
    const patches = [
        actionSheetPatch(),
        installButtonPatch()
    ]

    return () => patches.map(p => p());
}
