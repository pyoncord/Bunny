import { VendettaObject } from "@types";
import patcher from "@lib/patcher";
import { getVendettaLoaderIdentity } from "@lib/loader";
import settings, { loaderConfig } from "@lib/settings";
import * as debug from "@lib/debug";
import * as plugins from "@lib/plugins";
import * as themes from "@lib/themes";
import * as commands from "@lib/commands";
import * as storage from "@lib/storage";
import * as metro from "@metro/filters";
import * as common from "@metro/common";
import * as components from "@ui/components";
import * as toasts from "@ui/toasts";
import * as alerts from "@ui/alerts";
import * as assets from "@ui/assets";
import * as color from "@ui/color";
import * as utils from "@lib/utils";

export const createVendettaObject = (unloads: any[]): VendettaObject => ({
    patcher: {
        before: patcher.before,
        after: patcher.after,
        instead: patcher.instead
    },
    metro: { 
        find: (filter) => metro.find(filter),
        findAll: (filter) => metro.findAll(filter),
        findByProps: (filter) => metro.findByProps(filter),
        findByPropsAll: (filter) => metro.findByPropsAll(filter),
        findByName: (name, defaultExp?) => metro.findByName(name, defaultExp),
        findByNameAll: (name, defaultExp?) => metro.findByNameAll(name, defaultExp),
        findByDisplayName: (displayName, defaultExp?) => metro.findByDisplayName(displayName, defaultExp),
        findByDisplayNameAll: (displayName, defaultExp?) => metro.findByDisplayNameAll(displayName, defaultExp),
        findByTypeName: (typeName, defaultExp?) => metro.findByTypeName(typeName, defaultExp),
        findByTypeNameAll: (typeName, defaultExp?) => metro.findByTypeNameAll(typeName, defaultExp),
        findByStoreName: (name: string) => metro.findByStoreName(name),
        common: {
            constants: common.constants,
            channels: common.channels,
            i18n: common.i18n,
            url: common.url,
            toasts: common.toasts,
            stylesheet: common.stylesheet,
            clipboard: common.clipboard,
            assets: common.assets,
            invites: common.invites,
            commands: common.commands,
            navigation: common.navigation,
            navigationStack: common.navigationStack,
            NavigationNative: common.NavigationNative,
            Flux: common.Flux,
            FluxDispatcher: common.FluxDispatcher,
            React: common.React,
            ReactNative: common.ReactNative,
            moment: common.moment,
            chroma: common.chroma,
            lodash: common.lodash,
            util: common.util
        }
    },
    constants: {
        DISCORD_SERVER: "https://discord.gg/n9QQ4XhhJP",
        GITHUB: "https://github.com/vendetta-mod",
        PROXY_PREFIX:  "https://vd-plugins.github.io/proxy",
        HTTP_REGEX:  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
        HTTP_REGEX_MULTI: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
        DISCORD_SERVER_ID: "1015931589865246730",
        PLUGINS_CHANNEL_ID: "1091880384561684561",
        THEMES_CHANNEL_ID: "1091880434939482202",
    },
    utils: {
        findInReactTree: (tree, filter) => utils.findInReactTree(tree, filter),
        findInTree: (tree, filter, options) => utils.findInTree(tree, filter, options),
        safeFetch: (input, options?, timeout?) => utils.safeFetch(input, options, timeout),
        unfreeze: (obj: object) => utils.unfreeze(obj),
        without: (object, ...keys) => utils.without(object, ...keys)
    },
    debug: {
        connectToDebugger: (url: string) => debug.connectToDebugger(url),
        getDebugInfo: () => debug.getDebugInfo()
    },
    ui: {
        components: {
            Forms: components.Forms,
            General: components.General,
            Alert: components.Alert,
            Button: components.Button,
            HelpMessage: components.HelpMessage,
            SafeAreaView: components.SafeAreaView,
            Summary: components.Summary,
            ErrorBoundary: components.ErrorBoundary,
            Codeblock: components.Codeblock,
            Search: components.Search
        },
        toasts: {
            showToast: (content: string, asset?: number) => toasts.showToast(content, asset)
        },
        alerts: {
            showConfirmationAlert: (options) => alerts.showConfirmationAlert(options),
            showCustomAlert: (component, props: any) => alerts.showCustomAlert(component, props),
            showInputAlert: (options) => alerts.showInputAlert(options)
        },
        assets: {
            all: assets.all,
            find: (filter: (a: any) => void) => assets.find(filter),
            getAssetByName: (name: string) => assets.getAssetByName(name),
            getAssetByID: (id: number) => assets.getAssetByID(id),
            getAssetIDByName: (name: string) => assets.getAssetIDByName(name)
        },
        semanticColors: color.semanticColors,
        rawColors: color.rawColors
    },
    plugins: {
        plugins: plugins.plugins,
        fetchPlugin: (id: string) => plugins.fetchPlugin(id),
        installPlugin: (id: string, enabled?: boolean | undefined) => plugins.installPlugin(id, enabled),
        startPlugin: (id: string) => plugins.startPlugin(id),
        stopPlugin: (id: string, disable?: boolean | undefined) => plugins.stopPlugin(id, disable),
        removePlugin: (id: string) => plugins.removePlugin(id),
        getSettings: (id: string) => plugins.getSettings(id)
    },
    themes: {
        themes: themes.themes,
        fetchTheme: (id: string, selected?: boolean) => themes.fetchTheme(id, selected),
        installTheme: (id: string) => themes.installTheme(id),
        selectTheme: (id: string) => themes.selectTheme(id),
        removeTheme: (id: string) => themes.removeTheme(id),
        getCurrentTheme: () => themes.getThemeFromLoader(),
        updateThemes: () => themes.updateThemes()
    },
    commands: {
        registerCommand: commands.registerCommand
    },
    storage: {
        createProxy: (target) => storage.createProxy(target),
        useProxy: <T>(_storage: T) => storage.useProxy(_storage),
        createStorage: (backend: any) => storage.createStorage(backend),
        wrapSync: (store: any) => storage.wrapSync(store),
        awaitSyncWrapper: (store: any) => storage.awaitSyncWrapper(store),
        createMMKVBackend: (store: string) => storage.createMMKVBackend(store),
        createFileBackend: (file: string) => storage.createFileBackend(file)
    },
    settings,
    loader: {
        identity: getVendettaLoaderIdentity() ?? void 0,
        config: loaderConfig,
    },
    logger: {
        log: (...message) => console.log(...message),
        info: (...message) => console.info(...message),
        warn: (...message) => console.warn(...message),
        error: (...message) => console.error(...message),
        time: (...message) => console.time(...message),
        trace: (...message) => console.trace(...message),
        verbose: (...message) => console.log(...message)
    },
    version: debug.versionHash,
    unload: () => {
        unloads.filter(i => typeof i === "function").forEach(p => p());
        // @ts-expect-error explode
        delete window.vendetta;
    },
});
