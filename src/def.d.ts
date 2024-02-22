import * as _spitroast from "spitroast";
import _React from "react";
import _RN from "react-native";
import _Clipboard from "@react-native-clipboard/clipboard";
import _moment from "moment";
import _chroma from "chroma-js";
import _lodash from "lodash";

type MetroModules = { [id: number]: any };

// Component types
interface SummaryProps {
    label: string;
    icon?: string;
    noPadding?: boolean;
    noAnimation?: boolean;
    children: JSX.Element | JSX.Element[];
}

interface ErrorBoundaryProps {
    children: JSX.Element | JSX.Element[];
}

interface CodeblockProps {
    selectable?: boolean;
    style?: _RN.TextStyle;
    children?: string;
}

interface SearchProps {
    onChangeText?: (v: string) => void;
    placeholder?: string;
    style?: _RN.TextStyle;
}

// Helper types for API functions
type PropIntellisense<P extends string | symbol> = Record<P, any> & Record<PropertyKey, any>;
type PropsFinder = <T extends string | symbol>(...props: T[]) => PropIntellisense<T>;
type PropsFinderAll = <T extends string | symbol>(...props: T[]) => PropIntellisense<T>[];

type LoggerFunction = (...messages: any[]) => void;
interface Logger {
    log: LoggerFunction;
    info: LoggerFunction;
    warn: LoggerFunction;
    error: LoggerFunction;
    time: LoggerFunction;
    trace: LoggerFunction;
    verbose: LoggerFunction;
}

type SearchTree = Record<string, any>;
type SearchFilter = (tree: SearchTree) => boolean;
interface FindInTreeOptions {
    walkable?: string[];
    ignore?: string[];
    maxDepth?: number;
}

interface Asset {
    name: string;
    id: number;
}

export enum ButtonColors {
    BRAND = "brand",
    RED = "red",
    GREEN = "green",
    PRIMARY = "primary",
    TRANSPARENT = "transparent",
    GREY = "grey",
    LIGHTGREY = "lightgrey",
    WHITE = "white",
    LINK = "link"
}

interface ConfirmationAlertOptions {
    title?: string;
    content: string | JSX.Element | (string | JSX.Element)[];
    confirmText?: string;
    confirmColor?: ButtonColors;
    onConfirm: () => void;
    secondaryConfirmText?: string;
    onConfirmSecondary?: () => void;
    cancelText?: string;
    onCancel?: () => void;
    isDismissable?: boolean;
}

interface InputAlertProps {
    title?: string;
    confirmText?: string;
    confirmColor?: ButtonColors;
    onConfirm: (input: string) => (void | Promise<void>);
    cancelText?: string;
    placeholder?: string;
    initialValue?: string;
    secureTextEntry?: boolean;
}

interface Author {
    name: string;
    id?: string;
}

// See https://github.com/vendetta-mod/polymanifest
interface PluginManifest {
    name: string;
    description: string;
    authors: Author[];
    main: string;
    hash: string;
    // Vendor-specific field, contains our own data
    vendetta?: {
        icon?: string;
    };
}

interface Plugin {
    id: string;
    manifest: PluginManifest;
    enabled: boolean;
    update: boolean;
    js: string;
}

interface ThemeData {
    name: string;
    description?: string;
    authors?: Author[];
    spec: number;
    semanticColors?: Record<string, (string | false)[]>;
    rawColors?: Record<string, string>;
    background?: {
        url: string;
        blur?: number;
        /**
         * The alpha value of the background.
         * `CHAT_BACKGROUND` of semanticColors alpha value will be ignored when this is specified
        */
        alpha?: number;
    }
}

interface Theme {
    id: string;
    selected: boolean;
    data: ThemeData;
}

interface Settings {
    debuggerUrl: string;
    developerSettings: boolean;
    safeMode?: {
        enabled: boolean;
        currentThemeId?: string;
    };
}

interface ApplicationCommand {
    description: string;
    name: string;
    options: ApplicationCommandOption[];
    execute: (args: any[], ctx: CommandContext) => CommandResult | void | Promise<CommandResult> | Promise<void>;
    id?: string;
    applicationId: string;
    displayName: string;
    displayDescription: string;
    inputType: ApplicationCommandInputType;
    type: ApplicationCommandType;
}

export enum ApplicationCommandInputType {
    BUILT_IN,
    BUILT_IN_TEXT,
    BUILT_IN_INTEGRATION,
    BOT,
    PLACEHOLDER,
}

interface ApplicationCommandOption {
    name: string;
    description: string;
    required?: boolean;
    type: ApplicationCommandOptionType;
    displayName: string;
    displayDescription: string;
}

export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP,
    STRING,
    INTEGER,
    BOOLEAN,
    USER,
    CHANNEL,
    ROLE,
    MENTIONABLE,
    NUMBER,
    ATTACHMENT,
}

export enum ApplicationCommandType {
    CHAT = 1,
    USER,
    MESSAGE,
}

interface CommandContext {
    channel: any;
    guild: any;
}

interface CommandResult {
    content: string;
    tts?: boolean;
}

interface RNConstants extends _RN.PlatformConstants {
    // Android
    Version: number;
    Release: string;
    Serial: string;
    Fingerprint: string;
    Model: string;
    Brand: string;
    Manufacturer: string;
    ServerHost?: string;

    // iOS
    forceTouchAvailable: boolean;
    interfaceIdiom: string;
    osVersion: string;
    systemName: string;
}

/**
 * A key-value storage based upon `SharedPreferences` on Android.
 *
 * These types are based on Android though everything should be the same between
 * platforms.
 */
interface MMKVManager {
    /**
     * Get the value for the given `key`, or null
     * @param key The key to fetch
     */
    getItem: (key: string) => Promise<string | null>;
    /**
     * Deletes the value for the given `key`
     * @param key The key to delete
    */
    removeItem: (key: string) => void;
    /**
     * Sets the value of `key` to `value`
     */
    setItem: (key: string, value: string) => void;
    /**
     * Goes through every item in storage and returns it, excluding the
     * keys specified in `exclude`.
     * @param exclude A list of items to exclude from result
     */
    refresh: (exclude: string[]) => Promise<Record<string, string>>;
    /**
     * You will be murdered if you use this function.
     * Clears ALL of Discord's settings.
     */
    clear: () => void;
}

interface FileManager {
    /**
     * @param path **Full** path to file
     */
    fileExists: (path: string) => Promise<boolean>;
    /**
     * Allowed URI schemes on Android: `file://`, `content://` ([See here](https://developer.android.com/reference/android/content/ContentResolver#accepts-the-following-uri-schemes:_3))
     */
    getSize: (uri: string) => Promise<boolean>;
    /**
     * @param path **Full** path to file
     * @param encoding Set to `base64` in order to encode response
     */
    readFile(path: string, encoding: "base64" | "utf8"): Promise<string>;
    saveFileToGallery?(uri: string, fileName: string, fileType: "PNG" | "JPEG"): Promise<string>;
    /**
     * Beware! This function has differing functionality on iOS and Android.
     * @param storageDir Either `cache` or `documents`.
     * @param path Path in `storageDir`, parents are recursively created.
     * @param data The data to write to the file
     * @param encoding Set to `base64` if `data` is base64 encoded.
     * @returns Promise that resolves to path of the file once it got written
     */
    writeFile(storageDir: "cache" | "documents", path: string, data: string, encoding: "base64" | "utf8"): Promise<string>;
    removeFile(storageDir: "cache" | "documents", path: string): Promise<unknown>;
    getConstants: () => {
        /**
         * The path the `documents` storage dir (see {@link writeFile}) represents.
         */
        DocumentsDirPath: string;
        CacheDirPath: string;
    };
    /**
     * Will apparently cease to exist some time in the future so please use {@link getConstants} instead.
     * @deprecated
     */
    DocumentsDirPath: string;
}

type EmitterEvent = "SET" | "GET" | "DEL";

interface EmitterListenerData {
    path: string[];
    value?: any;
}

type EmitterListener = (
    event: EmitterEvent,
    data: EmitterListenerData | any
) => any;

type EmitterListeners = Record<string, Set<EmitterListener>>

interface Emitter {
    listeners: EmitterListeners;
    on: (event: EmitterEvent, listener: EmitterListener) => void;
    off: (event: EmitterEvent, listener: EmitterListener) => void;
    once: (event: EmitterEvent, listener: EmitterListener) => void;
    emit: (event: EmitterEvent, data: EmitterListenerData) => void;
}

interface StorageBackend {
    get: () => unknown | Promise<unknown>;
    set: (data: unknown) => void | Promise<void>;
}

interface LoaderConfig {
    customLoadUrl: {
        enabled: boolean;
        url: string;
    };
    loadReactDevTools: boolean;
}

interface LoaderIdentity {
    name: string;
    features: {
        loaderConfig?: boolean;
        devtools?: {
            prop: string;
            version: string;
        },
        themes?: {
            prop: string;
        }
    }
}

interface DiscordStyleSheet {
    [index: string]: any,
    createStyles: <T extends _RN.StyleSheet.NamedStyles<T>>(sheet: T | (() => T)) => () => T;
    createThemedStyleSheet: typeof import("react-native").StyleSheet.create;
}

interface VendettaObject {
    patcher: {
        after: typeof _spitroast.after;
        before: typeof _spitroast.before;
        instead: typeof _spitroast.instead;
    };
    metro: {
        find: (filter: (m: any) => boolean) => any;
        findAll: (filter: (m: any) => boolean) => any[];
        findByProps: PropsFinder;
        findByPropsAll: PropsFinderAll;
        findByName: (name: string, defaultExp?: boolean) => any;
        findByNameAll: (name: string, defaultExp?: boolean) => any[];
        findByDisplayName: (displayName: string, defaultExp?: boolean) => any;
        findByDisplayNameAll: (displayName: string, defaultExp?: boolean) => any[];
        findByTypeName: (typeName: string, defaultExp?: boolean) => any;
        findByTypeNameAll: (typeName: string, defaultExp?: boolean) => any[];
        findByStoreName: (name: string) => any;
        common: {
            constants: PropIntellisense<"Fonts" | "Permissions">;
            channels: PropIntellisense<"getVoiceChannelId">;
            i18n: PropIntellisense<"Messages">;
            url: PropIntellisense<"openURL">;
            toasts: PropIntellisense<"open" | "close">;
            stylesheet: DiscordStyleSheet;
            clipboard: typeof _Clipboard;
            assets: PropIntellisense<"registerAsset">;
            invites: PropIntellisense<"acceptInviteAndTransitionToInviteChannel">;
            commands: PropIntellisense<"getBuiltInCommands">;
            navigation: PropIntellisense<"pushLazy">;
            navigationStack: PropIntellisense<"createStackNavigator">;
            NavigationNative: PropIntellisense<"NavigationContainer">;
            // You may ask: "Why not just install Flux's types?"
            // Answer: Discord have a (presumably proprietary) fork. It's wildly different.
            Flux: PropIntellisense<"connectStores">;
            FluxDispatcher: PropIntellisense<"_currentDispatchActionType">;
            React: typeof _React;
            ReactNative: typeof _RN;
            moment: typeof _moment;
            chroma: typeof _chroma;
            lodash: typeof _lodash;
            util: PropIntellisense<"inspect" | "isNullOrUndefined">;
        };
    };
    constants: {
        DISCORD_SERVER: string;
        DISCORD_SERVER_ID: string;
        PLUGINS_CHANNEL_ID: string;
        THEMES_CHANNEL_ID: string;
        GITHUB: string;
        PROXY_PREFIX: string;
        HTTP_REGEX: RegExp;
        HTTP_REGEX_MULTI: RegExp;
    };
    utils: {
        findInReactTree: (tree: SearchTree, filter: SearchFilter) => any;
        findInTree: (tree: SearchTree, filter: SearchFilter, options: FindInTreeOptions) => any;
        safeFetch: (input: RequestInfo | URL, options?: RequestInit, timeout?: number) => Promise<Response>;
        unfreeze: (obj: object) => object;
        without: <O extends object, K extends readonly (keyof O)[]>(object: O, ...keys: K) => Omit<O, typeof keys[number]>;
    };
    debug: {
        connectToDebugger: (url: string) => void;
        // TODO: Type output?
        getDebugInfo: () => void;
    }
    ui: {
        components: {
            // Discord
            Forms: PropIntellisense<"Form" | "FormSection">;
            General: PropIntellisense<"Button" | "Text" | "View">;
            Alert: _React.ComponentType;
            Button: _React.ComponentType<any> & { Looks: any, Colors: ButtonColors, Sizes: any };
            HelpMessage: _React.ComponentType;
            SafeAreaView: typeof _RN.SafeAreaView;
            // Vendetta
            Summary: _React.ComponentType<SummaryProps>;
            ErrorBoundary: _React.ComponentType<ErrorBoundaryProps>;
            Codeblock: _React.ComponentType<CodeblockProps>;
            Search: _React.ComponentType<SearchProps>;
        }
        toasts: {
            showToast: (content: string, asset?: number) => void;
        };
        alerts: {
            showConfirmationAlert: (options: ConfirmationAlertOptions) => void;
            showCustomAlert: (component: _React.ComponentType, props: any) => void;
            showInputAlert: (options: InputAlertProps) => void;
        };
        assets: {
            all: Record<string, Asset>;
            find: (filter: (a: any) => void) => Asset | null | undefined;
            getAssetByName: (name: string) => Asset;
            getAssetByID: (id: number) => Asset;
            getAssetIDByName: (name: string) => number;
        };
        // TODO: Make a vain attempt to type these
        semanticColors: Record<string, any>;
        rawColors: Record<string, any>;
    };
    plugins: {
        plugins: Record<string, Plugin>;
        fetchPlugin: (id: string) => Promise<void>;
        installPlugin: (id: string, enabled?: boolean) => Promise<void>;
        startPlugin: (id: string) => Promise<void>;
        stopPlugin: (id: string, disable?: boolean) => void;
        removePlugin: (id: string) => void;
        getSettings: (id: string) => JSX.Element;
    };
    themes: {
        themes: Record<string, Theme>;
        fetchTheme: (id: string, selected?: boolean) => Promise<void>;
        installTheme: (id: string) => Promise<void>;
        selectTheme: (id: string) => Promise<void>;
        removeTheme: (id: string) => Promise<boolean>;
        getCurrentTheme: () => Theme | null;
        updateThemes: () => Promise<void>;
    };
    commands: {
        registerCommand: (command: ApplicationCommand) => () => void;
    };
    storage: {
        createProxy: <T>(target: T) => { proxy: T, emitter: Emitter };
        useProxy: <T>(storage: T) => T;
        createStorage: <T>(backend: StorageBackend) => Promise<Awaited<T>>;
        wrapSync: <T extends Promise<any>>(store: T) => Awaited<T>;
        awaitSyncWrapper: (store: any) => Promise<void>;
        createMMKVBackend: (store: string) => StorageBackend;
        createFileBackend: (file: string) => StorageBackend;
    };
    settings: Settings;
    loader: {
        identity?: LoaderIdentity;
        config: LoaderConfig;
    };
    logger: Logger;
    version: string;
    unload: () => void;
}

interface VendettaPluginObject {
    id: string;
    manifest: PluginManifest;
    storage: Record<string, any>;
}

declare global {
    type React = typeof _React;
    const __vendettaVersion: string;

    interface Window {
        [key: PropertyKey]: any;
        modules: MetroModules;
        vendetta: VendettaObject;
        React: typeof _React;
    }
}
