import { VdThemeInfo } from "@lib/addons/themes";

// @ts-ignore
const pyonLoaderIdentity = globalThis.__PYON_LOADER__;
// @ts-ignore
const vendettaLoaderIdentity = globalThis.__vendetta_loader;

export interface VendettaLoaderIdentity {
    name: string;
    features: {
        loaderConfig?: boolean;
        devtools?: {
            prop: string;
            version: string;
        },
        themes?: {
            prop: string;
        };
    };
}

export function isVendettaLoader() {
    return vendettaLoaderIdentity != null;
}

export function isPyonLoader() {
    return pyonLoaderIdentity != null;
}

function polyfillVendettaLoaderIdentity() {
    if (!isPyonLoader() || isVendettaLoader()) return null;

    const loader = {
        name: pyonLoaderIdentity.loaderName,
        features: {} as Record<string, any>
    };

    if (isLoaderConfigSupported()) loader.features.loaderConfig = true;
    if (isSysColorsSupported()) {
        loader.features.syscolors = {
            prop: "__vendetta_syscolors"
        };

        Object.defineProperty(globalThis, "__vendetta_syscolors", {
            get: () => getSysColors(),
            configurable: true
        });
    }
    if (isThemeSupported()) {
        loader.features.themes = {
            prop: "__vendetta_theme"
        };

        Object.defineProperty(globalThis, "__vendetta_theme", {
            // get: () => getStoredTheme(),
            get: () => {
                // PyonXposed only returns keys it parses, making custom keys like Themes+' to gone
                const id = getStoredTheme()?.id;
                if (!id) return null;

                const { themes } = require("@lib/addons/themes");
                return themes[id] ?? getStoredTheme() ?? null;
            },
            configurable: true
        });
    }

    Object.defineProperty(globalThis, "__vendetta_loader", {
        get: () => loader,
        configurable: true
    });

    return loader as VendettaLoaderIdentity;
}

export function getLoaderIdentity() {
    if (isPyonLoader()) {
        return pyonLoaderIdentity;
    } else if (isVendettaLoader()) {
        return getVendettaLoaderIdentity();
    }

    return null;
}

export function getVendettaLoaderIdentity(): VendettaLoaderIdentity | null {
    // @ts-ignore
    if (globalThis.__vendetta_loader) return globalThis.__vendetta_loader;
    return polyfillVendettaLoaderIdentity();
}

// add to __vendetta_loader anyway
getVendettaLoaderIdentity();

export function getLoaderName() {
    if (isPyonLoader()) return pyonLoaderIdentity.loaderName;
    else if (isVendettaLoader()) return vendettaLoaderIdentity.name;

    return "Unknown";
}

export function getLoaderVersion(): string | null {
    if (isPyonLoader()) return pyonLoaderIdentity.loaderVersion;
    return null;
}

export function isLoaderConfigSupported() {
    if (isPyonLoader()) {
        return true;
    } else if (isVendettaLoader()) {
        return vendettaLoaderIdentity!!.features.loaderConfig;
    }

    return false;
}

export function isThemeSupported() {
    if (isPyonLoader()) {
        return pyonLoaderIdentity.hasThemeSupport;
    } else if (isVendettaLoader()) {
        return vendettaLoaderIdentity!!.features.themes != null;
    }

    return false;
}

export function getStoredTheme(): VdThemeInfo | null {
    if (isPyonLoader()) {
        return pyonLoaderIdentity.storedTheme;
    } else if (isVendettaLoader()) {
        const themeProp = vendettaLoaderIdentity!!.features.themes?.prop;
        if (!themeProp) return null;
        // @ts-ignore
        return globalThis[themeProp] || null;
    }

    return null;
}

export function getThemeFilePath() {
    if (isPyonLoader()) {
        return "pyoncord/current-theme.json";
    } else if (isVendettaLoader()) {
        return "vendetta_theme.json";
    }

    return null;
}

export function isReactDevToolsPreloaded() {
    if (isPyonLoader()) {
        return Boolean(window.__reactDevTools);
    }
    if (isVendettaLoader()) {
        return vendettaLoaderIdentity!!.features.devtools != null;
    }

    return false;
}

export function getReactDevToolsProp(): string | null {
    if (!isReactDevToolsPreloaded()) return null;

    if (isPyonLoader()) {
        window.__pyoncord_rdt = window.__reactDevTools.exports;
        return "__pyoncord_rdt";
    }

    if (isVendettaLoader()) {
        return vendettaLoaderIdentity!!.features.devtools!!.prop;
    }

    return null;
}

export function getReactDevToolsVersion() {
    if (!isReactDevToolsPreloaded()) return null;

    if (isPyonLoader()) {
        return window.__reactDevTools.version || null;
    }
    if (isVendettaLoader()) {
        return vendettaLoaderIdentity!!.features.devtools!!.version;
    }

    return null;
}

export function isSysColorsSupported() {
    if (isPyonLoader()) return pyonLoaderIdentity.isSysColorsSupported;
    else if (isVendettaLoader()) {
        return vendettaLoaderIdentity!!.features.syscolors != null;
    }

    return false;
}

export function getSysColors() {
    if (!isSysColorsSupported()) return null;
    if (isPyonLoader()) {
        return pyonLoaderIdentity.sysColors;
    } else if (isVendettaLoader()) {
        return vendettaLoaderIdentity!!.features.syscolors!!.prop;
    }

    return null;
}

export function getLoaderConfigPath() {
    if (isPyonLoader()) {
        return "pyoncord/loader.json";
    } else if (isVendettaLoader()) {
        return "vendetta_loader.json";
    }

    return "loader.json";
}

export function isFontSupported() {
    if (isPyonLoader()) return pyonLoaderIdentity.fontPatch === 2;

    return false;
}
