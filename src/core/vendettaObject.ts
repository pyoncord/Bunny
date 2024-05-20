import * as assets from "@lib/api/assets";
import * as commands from "@lib/api/commands";
import { getVendettaLoaderIdentity, isPyonLoader } from "@lib/api/native/loader";
import patcher from "@lib/api/patcher";
import * as storage from "@lib/api/storage";
import * as debug from "@lib/debug";
import * as plugins from "@lib/managers/plugins";
import * as themes from "@lib/managers/themes";
import { loaderConfig, settings } from "@lib/settings";
import * as utils from "@lib/utils";
import * as metro from "@metro";
import * as common from "@metro/common";
import * as alerts from "@ui/alerts";
import * as color from "@ui/color";
import * as components from "@ui/components";
import { Forms } from "@ui/components/discord/Forms";
import { CompatfulRedesign } from "@ui/components/discord/Redesign";
import { createThemedStyleSheet } from "@ui/styles";
import * as toasts from "@ui/toasts";
import SparkMD5 from "spark-md5";

export const initVendettaObject = (): any => {
    const api = window.vendetta = {
        patcher: {
            before: patcher.before,
            after: patcher.after,
            instead: patcher.instead
        },
        metro: {
            modules: window.modules,
            find: (filter: (m: any) => boolean) => {
                return metro.find(metro.createSimpleFilter(filter, SparkMD5.hash(new Error().stack!)));
            },
            findAll: (filter: (m: any) => boolean) => {
                return metro.findAll(metro.createSimpleFilter(filter, SparkMD5.hash(new Error().stack!)));
            },
            findByProps: (...props: any) => {
                // Decor fix hack
                if (props.length === 1 && props[0] === "KeyboardAwareScrollView") {
                    props.push("listenToKeyboardEvents");
                }

                return metro.findByProps(...props);
            },
            findByPropsAll: (...props: any) => metro.findByPropsAll(...props),
            findByName: (name: string, defaultExp?: boolean | undefined) => {
                // Decor fix hack
                if (name === "create" && typeof defaultExp === "undefined") {
                    return metro.findByName("create", false).default;
                }

                return metro.findByName(name, defaultExp ?? true);
            },
            findByNameAll: (name: string, defaultExp: boolean = true) => metro.findByNameAll(name, defaultExp),
            findByDisplayName: (displayName: string, defaultExp: boolean = true) => metro.findByDisplayName(displayName, defaultExp),
            findByDisplayNameAll: (displayName: string, defaultExp: boolean = true) => metro.findByDisplayNameAll(displayName, defaultExp),
            findByTypeName: (typeName: string, defaultExp: boolean = true) => metro.findByTypeName(typeName, defaultExp),
            findByTypeNameAll: (typeName: string, defaultExp: boolean = true) => metro.findByTypeNameAll(typeName, defaultExp),
            findByStoreName: (name: string) => metro.findByStoreName(name),
            common: {
                constants: common.constants,
                channels: common.channels,
                i18n: common.i18n,
                url: common.url,
                toasts: common.toasts,
                stylesheet: {
                    ...CompatfulRedesign,
                    createThemedStyleSheet
                },
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
            PROXY_PREFIX: "https://vd-plugins.github.io/proxy",
            HTTP_REGEX: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
            HTTP_REGEX_MULTI: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
            DISCORD_SERVER_ID: "1015931589865246730",
            PLUGINS_CHANNEL_ID: "1091880384561684561",
            THEMES_CHANNEL_ID: "1091880434939482202",
        },
        utils: {
            findInReactTree: (tree: { [key: string]: any; }, filter: any) => utils.findInReactTree(tree, filter),
            findInTree: (tree: any, filter: any, options: any) => utils.findInTree(tree, filter, options),
            safeFetch: (input: RequestInfo | URL, options?: RequestInit | undefined, timeout?: number | undefined) => utils.safeFetch(input, options, timeout),
            unfreeze: (obj: object) => Object.isFrozen(obj) ? ({ ...obj }) : obj,
            without: (object: any, ...keys: any) => utils.without(object, ...keys)
        },
        debug: {
            connectToDebugger: (url: string) => debug.connectToDebugger(url),
            getDebugInfo: () => debug.getDebugInfo()
        },
        ui: {
            components: {
                Forms,
                General: common.ReactNative,
                Alert: components.discord.Alert,
                Button: components.discord.Button,
                HelpMessage: components.discord.HelpMessage,
                SafeAreaView: components.discord.SafeAreaView,
                Summary: components.Summary,
                ErrorBoundary: components.ErrorBoundary,
                Codeblock: components.Codeblock,
                Search: components.Search
            },
            toasts: {
                showToast: (content: string, asset?: number) => toasts.showToast(content, asset)
            },
            alerts: {
                showConfirmationAlert: (options: any) => alerts.showConfirmationAlert(options),
                showCustomAlert: (component: React.ComponentType<any>, props: any) => alerts.showCustomAlert(component, props),
                showInputAlert: (options: any) => alerts.showInputAlert(options)
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
            selectTheme: (id: string) => themes.selectTheme(id === "default" ? null : themes.themes[id]),
            removeTheme: (id: string) => themes.removeTheme(id),
            getCurrentTheme: () => themes.getThemeFromLoader(),
            updateThemes: () => themes.updateThemes()
        },
        commands: {
            registerCommand: commands.registerCommand
        },
        storage: {
            createProxy: (target: any) => storage.createProxy(target),
            useProxy: <T>(_storage: T) => storage.useProxy(_storage),
            createStorage: (backend: any) => storage.createStorage(backend),
            wrapSync: (store: any) => storage.wrapSync(store),
            awaitSyncWrapper: (store: any) => storage.awaitSyncWrapper(store),
            createMMKVBackend: (store: string) => storage.createMMKVBackend(store),
            createFileBackend: (file: string) => {
                // Redirect path to vendetta_theme.json
                if (isPyonLoader() && file === "vendetta_theme.json") {
                    file = "pyoncord/current-theme.json";
                }

                return storage.createFileBackend(file);
            }
        },
        settings,
        loader: {
            identity: getVendettaLoaderIdentity() ?? void 0,
            config: loaderConfig,
        },
        logger: {
            log: (...message: any) => console.log(...message),
            info: (...message: any) => console.info(...message),
            warn: (...message: any) => console.warn(...message),
            error: (...message: any) => console.error(...message),
            time: (...message: any) => console.time(...message),
            trace: (...message: any) => console.trace(...message),
            verbose: (...message: any) => console.log(...message)
        },
        version: debug.versionHash,
        unload: () => {
            delete window.vendetta;
        },
    };

    return () => api.unload();
};
