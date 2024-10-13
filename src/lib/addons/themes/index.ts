/**
 * Theming system in Bunny is currently a prototype, expect an unreadable theme implementation below
 */

import { awaitStorage, createFileBackend, createMMKVBackend, createStorage, wrapSync } from "@core/vendetta/storage";
import { Author } from "@lib/addons/types";
import { getStoredTheme, getThemeFilePath } from "@lib/api/native/loader";
import { ThemeManager } from "@lib/api/native/modules";
import { after, before, instead } from "@lib/api/patcher";
import { findInReactTree, safeFetch } from "@lib/utils";
import { lazyDestructure, proxyLazy } from "@lib/utils/lazy";
import { byMutableProp } from "@metro/filters";
import { createLazyModule } from "@metro/lazy";
import { findByNameLazy, findByProps, findByPropsLazy, findByStoreNameLazy } from "@metro/wrappers";
import chroma from "chroma-js";
import { ImageBackground, Platform, processColor } from "react-native";

export interface ThemeData {
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
    };
}

export interface Theme {
    id: string;
    selected: boolean;
    data: ThemeData;
}

//! As of 173.10, early-finding this does not work.
// Somehow, this is late enough, though?
export const color = findByPropsLazy("SemanticColor");

const mmkvStorage = proxyLazy(() => {
    const newModule = findByProps("impl");
    if (typeof newModule?.impl === "object") return newModule.impl;
    return findByProps("storage");
});

const appearanceManager = findByPropsLazy("updateTheme");
const ThemeStore = findByStoreNameLazy("ThemeStore");
const formDividerModule = findByPropsLazy("DIVIDER_COLORS");
const MessagesWrapperConnected = findByNameLazy("MessagesWrapperConnected", false);
const { MessagesWrapper } = lazyDestructure(() => findByProps("MessagesWrapper"));
const isThemeModule = createLazyModule(byMutableProp("isThemeDark"));

export const themes = wrapSync(createStorage<Record<string, Theme>>(createMMKVBackend("VENDETTA_THEMES")));

const semanticAlternativeMap: Record<string, string> = {
    "BG_BACKDROP": "BACKGROUND_FLOATING",
    "BG_BASE_PRIMARY": "BACKGROUND_PRIMARY",
    "BG_BASE_SECONDARY": "BACKGROUND_SECONDARY",
    "BG_BASE_TERTIARY": "BACKGROUND_SECONDARY_ALT",
    "BG_MOD_FAINT": "BACKGROUND_MODIFIER_ACCENT",
    "BG_MOD_STRONG": "BACKGROUND_MODIFIER_ACCENT",
    "BG_MOD_SUBTLE": "BACKGROUND_MODIFIER_ACCENT",
    "BG_SURFACE_OVERLAY": "BACKGROUND_FLOATING",
    "BG_SURFACE_OVERLAY_TMP": "BACKGROUND_FLOATING",
    "BG_SURFACE_RAISED": "BACKGROUND_MOBILE_PRIMARY"
};

async function writeTheme(theme: Theme | {}) {
    if (typeof theme !== "object") throw new Error("Theme must be an object");

    // Save the current theme as current-theme.json. When supported by loader,
    // this json will be written to appropriate path and be used to theme the native side.
    await createFileBackend(getThemeFilePath() || "theme.json").set(theme);
}

/**
 * @internal
 */
export function patchChatBackground() {
    const patches = [
        after("default", MessagesWrapperConnected, (_, ret) => enabled ? React.createElement(ImageBackground, {
            style: { flex: 1, height: "100%" },
            source: currentTheme?.data?.background?.url && { uri: currentTheme.data.background.url } || 0,
            blurRadius: typeof currentTheme?.data?.background?.blur === "number" ? currentTheme?.data?.background?.blur : 0,
            children: ret,
        }) : ret),
        after("render", MessagesWrapper.prototype, (_, ret) => {
            if (!enabled || !currentTheme?.data?.background?.url) return;

            // HORRIBLE
            const Messages = findInReactTree(ret, x => x && "HACK_fixModalInteraction" in x.props && x?.props?.style);
            if (Messages) {
                Messages.props.style = [
                    Messages.props.style,
                    {
                        backgroundColor: chroma(Messages.props.style.backgroundColor || "black")
                            .alpha(1 - (currentTheme?.data.background?.alpha ?? 1)).hex()
                    },
                ];
            }
            else console.error("Didn't find Messages when patching MessagesWrapper!");
        })
    ];

    return () => patches.forEach(x => x());
}

function normalizeToHex(colorString: string): string {
    if (chroma.valid(colorString)) return chroma(colorString).hex();

    const color = Number(processColor(colorString));

    return chroma.rgb(
        color >> 16 & 0xff, // red
        color >> 8 & 0xff, // green
        color & 0xff, // blue
        color >> 24 & 0xff // alpha
    ).hex();
}

// Process data for some compatiblity with native side
function processData(data: ThemeData) {
    if (data.semanticColors) {
        const { semanticColors } = data;

        for (const key in semanticColors) {
            for (const index in semanticColors[key]) {
                semanticColors[key][index] &&= normalizeToHex(semanticColors[key][index] as string);
            }
        }
    }

    if (data.rawColors) {
        const { rawColors } = data;

        for (const key in rawColors) {
            data.rawColors[key] = normalizeToHex(rawColors[key]);
        }

        if (Platform.OS === "android") applyAndroidAlphaKeys(rawColors);
    }

    // this field is required by the spec but vd seems to ignore this
    // so are most vd themes
    data.spec ??= 2;

    return data;
}

function applyAndroidAlphaKeys(rawColors: Record<string, string>) {
    // these are native Discord Android keys
    const alphaMap: Record<string, [string, number]> = {
        "BLACK_ALPHA_60": ["BLACK", 0.6],
        "BRAND_NEW_360_ALPHA_20": ["BRAND_360", 0.2],
        "BRAND_NEW_360_ALPHA_25": ["BRAND_360", 0.25],
        "BRAND_NEW_500_ALPHA_20": ["BRAND_500", 0.2],
        "PRIMARY_DARK_500_ALPHA_20": ["PRIMARY_500", 0.2],
        "PRIMARY_DARK_700_ALPHA_60": ["PRIMARY_700", 0.6],
        "STATUS_GREEN_500_ALPHA_20": ["GREEN_500", 0.2],
        "STATUS_RED_500_ALPHA_20": ["RED_500", 0.2],
    };

    for (const key in alphaMap) {
        const [colorKey, alpha] = alphaMap[key];
        if (!rawColors[colorKey]) continue;
        rawColors[key] = chroma(rawColors[colorKey]).alpha(alpha).hex();
    }
}

export async function fetchTheme(id: string, selected = false) {
    let themeJSON: any;

    try {
        themeJSON = await (await safeFetch(id, { cache: "no-store" })).json();
    } catch {
        throw new Error(`Failed to fetch theme at ${id}`);
    }

    themes[id] = {
        id: id,
        selected: selected,
        data: processData(themeJSON),
    };

    // TODO: Should we prompt when the selected theme is updated?
    if (selected) {
        writeTheme(themes[id]);
        applyTheme(themes[id], vdThemeFallback);
    }
}

export async function installTheme(id: string) {
    if (typeof id !== "string" || id in themes) throw new Error("Theme already installed");
    await fetchTheme(id);
}

export function selectTheme(theme: Theme | null, write = true) {
    if (theme) theme.selected = true;
    Object.keys(themes).forEach(
        k => themes[k].selected = themes[k].id === theme?.id
    );

    if (theme == null && write) {
        return writeTheme({});
    } else if (theme) {
        return writeTheme(theme);
    }
}

export async function removeTheme(id: string) {
    const theme = themes[id];
    if (theme.selected) await selectTheme(null);
    delete themes[id];

    return theme.selected;
}

/**
 * @internal
 */
export function getThemeFromLoader(): Theme | null {
    return getStoredTheme();
}

export async function updateThemes() {
    await awaitStorage(themes);
    const currentTheme = getThemeFromLoader();
    await Promise.allSettled(Object.keys(themes).map(id => fetchTheme(id, currentTheme?.id === id)));
}

export function getCurrentTheme() {
    return currentTheme;
}

const origRawColor = { ...color.RawColor };

let inc = 0;
let vdKey = "vd-theme";

let vdThemeFallback = "darker";
let enabled = false;
let currentTheme: Theme | null;
let storageResolved = false;

const discordThemes = new Set(["darker", "midnight", "dark", "light"]);
function isDiscordTheme(name: string) {
    return discordThemes.has(name);
}

function patchColor() {
    const callback = ([theme]: any[]) => theme === vdKey ? [vdThemeFallback] : void 0;

    Object.keys(color.RawColor).forEach(k => {
        Object.defineProperty(color.RawColor, k, {
            configurable: true,
            enumerable: true,
            get: () => {
                return enabled ? currentTheme?.data?.rawColors?.[k] ?? origRawColor[k] : origRawColor[k];
            }
        });
    });

    before("isThemeDark", isThemeModule, callback);
    before("isThemeLight", isThemeModule, callback);
    before("updateTheme", ThemeManager, callback);

    after("get", mmkvStorage, ([a], ret) => {
        if (a === "SelectivelySyncedUserSettingsStore") {
            storageResolved = true;
            if (ret?._state?.appearance?.settings?.theme && enabled) {
                vdThemeFallback = ret._state.appearance.settings.theme;
                ret._state.appearance.settings.theme = vdKey;
            }
        } else if (a === "ThemeStore") {
            storageResolved = true;
            if (ret?._state?.theme && enabled) {
                vdThemeFallback = ret._state.theme;
                ret._state.theme = vdKey;
            }
        }
    });

    // Prevent setting to real Discord settings
    before("set", mmkvStorage, args => {
        if (!args[1]) return;

        const key = args[0];
        const value = JSON.parse(JSON.stringify(args[1]));

        const interceptors: Record<string, () => void> = ({
            SelectivelySyncedUserSettingsStore: () => {
                if (value._state?.appearance?.settings?.theme) {
                    const { theme } = value._state?.appearance?.settings ?? {};
                    if (isDiscordTheme(theme)) {
                        vdThemeFallback = theme;
                    } else {
                        value._state.appearance.settings.theme = vdThemeFallback;
                    }
                }
            },
            ThemeStore: () => {
                if (value._state?.theme) {
                    const { theme } = value._state;
                    if (isDiscordTheme(theme)) {
                        vdThemeFallback = theme;
                    } else {
                        value._state.theme = vdThemeFallback;
                    }
                }
            }
        });

        if (!(key in interceptors)) return args;

        interceptors[key]();
        return [key, value];
    });

    instead("resolveSemanticColor", color.default.meta ?? color.default.internal, (args, orig) => {
        if (!enabled || !currentTheme) return orig(...args);
        if (args[0] !== vdKey) return orig(...args);

        args[0] = vdThemeFallback;

        const [name, colorDef] = extractInfo(vdThemeFallback, args[1]);

        const themeIndex = vdThemeFallback === "midnight" ? 2 : vdThemeFallback === "light" ? 1 : 0;

        //! As of 192.7, Tabs v2 uses BG_ semantic colors instead of BACKGROUND_ ones
        const alternativeName = semanticAlternativeMap[name] ?? name;

        const semanticColorVal = (currentTheme.data?.semanticColors?.[name] ?? currentTheme.data?.semanticColors?.[alternativeName])?.[themeIndex];

        if (semanticColorVal) return semanticColorVal;

        const rawValue = currentTheme.data?.rawColors?.[colorDef.raw];
        if (rawValue) {
            // Set opacity if needed
            return colorDef.opacity === 1 ? rawValue : chroma(rawValue).alpha(colorDef.opacity).hex();
        }

        // Fallback to default
        return orig(...args);
    });
}

function getDefaultFallbackTheme(fallback: string = vdThemeFallback) {
    const theme = ThemeStore.theme.toLowerCase() as string;

    if (isDiscordTheme(theme)) {
        return theme;
    } else {
        return fallback;
    }
}

export function applyTheme(appliedTheme: Theme | null, fallbackTheme?: string) {
    if (!fallbackTheme) fallbackTheme = getDefaultFallbackTheme();

    currentTheme = appliedTheme;
    enabled = !!currentTheme;
    vdThemeFallback = fallbackTheme!!;
    vdKey = `vd-theme-${inc++}-${fallbackTheme}`;

    if (appliedTheme) {
        color.Theme[vdKey.toUpperCase()] = vdKey;

        formDividerModule.DIVIDER_COLORS[vdKey] = formDividerModule.DIVIDER_COLORS[vdThemeFallback];

        Object.keys(color.Shadow).forEach(k => color.Shadow[k][vdKey] = color.Shadow[k][vdThemeFallback]);
        Object.keys(color.SemanticColor).forEach(k => {
            color.SemanticColor[k][vdKey] = {
                ...color.SemanticColor[k][vdThemeFallback],
                override: appliedTheme?.data?.semanticColors?.[k]?.[0]
            };
        });
    }

    if (storageResolved) {
        appearanceManager.setShouldSyncAppearanceSettings(false);
        appearanceManager.updateTheme(appliedTheme ? vdKey : fallbackTheme);
    }
}

/**
 * @internal
 */
export function initThemes() {
    const currentTheme = getThemeFromLoader();
    enabled = Boolean(currentTheme);

    patchColor();
    applyTheme(currentTheme, vdThemeFallback);

    updateThemes().catch(e => console.error("Failed to update themes", e));
}

function extractInfo(themeName: string, colorObj: any): [name: string, colorDef: any] {
    // @ts-ignore - assigning to extractInfo._sym
    const propName = colorObj[extractInfo._sym ??= Object.getOwnPropertySymbols(colorObj)[0]];
    const colorDef = color.SemanticColor[propName];

    return [propName, colorDef[themeName]];
}
