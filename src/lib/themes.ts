import { Theme, ThemeData } from "@types";
import { ReactNative as RN, chroma } from "@metro/common";
import { findInReactTree, safeFetch } from "@lib/utils";
import { findByName, findByProps } from "@metro/filters";
import { instead, after } from "@lib/patcher";
import { createFileBackend, createMMKVBackend, createStorage, wrapSync, awaitSyncWrapper } from "@lib/storage";
import logger from "./logger";

//! As of 173.10, early-finding this does not work.
// Somehow, this is late enough, though?
export const color = findByProps("SemanticColor");

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
}

async function writeTheme(theme: Theme | {}) {
    if (typeof theme !== "object") throw new Error("Theme must be an object");

    // Save the current theme as vendetta_theme.json. When supported by loader,
    // this json will be written to window.__vendetta_theme and be used to theme the native side.
    await createFileBackend("vendetta_theme.json").set(theme);
}

export function patchChatBackground() {
    const currentBackground = getCurrentTheme()?.data?.background;
    if (!currentBackground) return;

    const MessagesWrapperConnected = findByName("MessagesWrapperConnected", false);
    if (!MessagesWrapperConnected) return;
    const { MessagesWrapper } = findByProps("MessagesWrapper");
    if (!MessagesWrapper) return;

    const patches = [
        after("default", MessagesWrapperConnected, (_, ret) => React.createElement(RN.ImageBackground, {
            style: { flex: 1, height: "100%" },
            source: { uri: currentBackground.url },
            blurRadius: typeof currentBackground.blur === "number" ? currentBackground.blur : 0,
            children: ret,
        })),
        after("render", MessagesWrapper.prototype, (_, ret) => {
            const Messages = findInReactTree(ret, (x) => "HACK_fixModalInteraction" in x?.props && x?.props?.style);
            if (Messages) 
                Messages.props.style = Object.assign(
                    RN.StyleSheet.flatten(Messages.props.style ?? {}),
                    {
                        backgroundColor: "#0000"
                    }
                );
            else
                logger.error("Didn't find Messages when patching MessagesWrapper!");
        })
    ];

    return () => patches.forEach(x => x());
}

function normalizeToHex(colorString: string): string {
    if (chroma.valid(colorString)) return chroma(colorString).hex();

    const color = Number(RN.processColor(colorString));

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
        const semanticColors = data.semanticColors;

        for (const key in semanticColors) {
            for (const index in semanticColors[key]) {
                semanticColors[key][index] &&= normalizeToHex(semanticColors[key][index] as string);
            }
        }
    }

    if (data.rawColors) {
        const rawColors = data.rawColors;

        for (const key in rawColors) {
            data.rawColors[key] = normalizeToHex(rawColors[key]);
        }

        if (RN.Platform.OS === "android") applyAndroidAlphaKeys(rawColors);
    }

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
    if (selected) writeTheme(themes[id]);
}

export async function installTheme(id: string) {
    if (typeof id !== "string" || id in themes) throw new Error("Theme already installed");
    await fetchTheme(id);
}

export async function selectTheme(id: string) {
    if (id === "default") return await writeTheme({});
    const selectedThemeId = Object.values(themes).find(i => i.selected)?.id;

    if (selectedThemeId) themes[selectedThemeId].selected = false;
    themes[id].selected = true;
    await writeTheme(themes[id]);
}

export async function removeTheme(id: string) {
    const theme = themes[id];
    if (theme.selected) await selectTheme("default");
    delete themes[id];

    return theme.selected;
}

export function getCurrentTheme(): Theme | null {
    const themeProp = window.__vendetta_loader?.features?.themes?.prop;
    if (!themeProp) return null;
    return window[themeProp] || null;
}

export async function updateThemes() {
    await awaitSyncWrapper(themes);
    const currentTheme = getCurrentTheme();
    await Promise.allSettled(Object.keys(themes).map(id => fetchTheme(id, currentTheme?.id === id)));
}

export async function initThemes() {
    //! Native code is required here!
    // Awaiting the sync wrapper is too slow, to the point where semanticColors are not correctly overwritten.
    // We need a workaround, and it will unfortunately have to be done on the native side.
    // await awaitSyncWrapper(themes);

    const selectedTheme = getCurrentTheme();
    if (!selectedTheme) return;

    const oldRaw = color.default.unsafe_rawColors;

    color.default.unsafe_rawColors = new Proxy(oldRaw, {
        get: (_, colorProp: string) => {
            if (!selectedTheme) return Reflect.get(oldRaw, colorProp);

            return selectedTheme.data?.rawColors?.[colorProp] ?? Reflect.get(oldRaw, colorProp);
        }
    });

    instead("resolveSemanticColor", color.default.meta ?? color.default.internal, (args, orig) => {
        if (!selectedTheme) return orig(...args);

        const [theme, propIndex] = args;
        const [name, colorDef] = extractInfo(theme, propIndex);
        
        const themeIndex = theme === "amoled" ? 2 : theme === "light" ? 1 : 0;
        
        //! As of 192.7, Tabs v2 uses BG_ semantic colors instead of BACKGROUND_ ones
        const alternativeName = semanticAlternativeMap[name] ?? name;

        const semanticColorVal = (selectedTheme.data?.semanticColors?.[name] ?? selectedTheme.data?.semanticColors?.[alternativeName])?.[themeIndex];
        if (name === "CHAT_BACKGROUND" && typeof selectedTheme.data?.background?.alpha === "number") {
            return chroma(semanticColorVal || "black").alpha(1 - selectedTheme.data.background.alpha).hex();
        }

        if (semanticColorVal) return semanticColorVal;

        const rawValue = selectedTheme.data?.rawColors?.[colorDef.raw];
        if (rawValue) {
            // Set opacity if needed
            return colorDef.opacity === 1 ? rawValue : chroma(rawValue).alpha(colorDef.opacity).hex();
        }

        // Fallback to default
        return orig(...args);
    });

    await updateThemes();
}

function extractInfo(themeMode: string, colorObj: any): [name: string, colorDef: any] {
    // @ts-ignore - assigning to extractInfo._sym
    const propName = colorObj[extractInfo._sym ??= Object.getOwnPropertySymbols(colorObj)[0]];
    const colorDef = color.SemanticColor[propName];

    return [propName, colorDef[themeMode.toLowerCase()]];
}