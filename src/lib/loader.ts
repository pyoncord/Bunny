import type { LoaderConfig, Theme } from "@types";

// @ts-ignore
const pyonLoaderConfig = globalThis.__PYON_LOADER__;
// @ts-ignore
const vendettaLoaderConfig = globalThis.__vendetta_loader;

export function isVendettaLoader() {
    return vendettaLoaderConfig != null;
}

export function isPyonLoader() {
    return pyonLoaderConfig != null;
}

function polyfillVendettaLoader() {
    if (!isPyonLoader() || isVendettaLoader()) return null;

    const loader = {
        name: pyonLoaderConfig.loaderName,
        features: {} as Record<string, any>
    }

    if (isLoaderConfigSupported()) loader.features.loaderConfig = true;
    if (isSysColorsSupported()) {
        loader.features.syscolors = {
            prop: "__vendetta_syscolors"
        }

        Object.defineProperty(globalThis, "__vendetta_syscolors", {
            get: () => getSysColors(),
            configurable: true
        });
    }
    if (isThemeSupported()) {
        loader.features.themes = {
            prop: "__vendetta_theme"
        }

        Object.defineProperty(globalThis, "__vendetta_theme", {
            get: () => getStoredTheme(),
            configurable: true
        });
    }

    Object.defineProperty(globalThis, "__vendetta_loader", {
        get: () => loader,
        configurable: true
    });

    return loader as unknown as LoaderConfig;
}

export function getVendettaLoader(): LoaderConfig | null {
    // @ts-ignore
    if (globalThis.__vendetta_loader) return globalThis.__vendetta_loader;
    return polyfillVendettaLoader();
}

// add to __vendetta_loader anyway
getVendettaLoader();

export function getLoaderName() {
    if (isPyonLoader()) return pyonLoaderConfig.loaderName;
    else if (isVendettaLoader()) return vendettaLoaderConfig.name;

    return "Unknown";
}

export function isLoaderConfigSupported() {
    if (isPyonLoader()) {
        return true;
    } else if (isVendettaLoader()) {
        return vendettaLoaderConfig!!.features.loaderConfig;
    }

    return false;
}

export function isThemeSupported() {
    if (isPyonLoader()) {
        return pyonLoaderConfig.hasThemeSupport;
    } else if (isVendettaLoader()) {
        return vendettaLoaderConfig!!.features.themes != null;
    }

    return false;
}

export function getStoredTheme(): Theme | null {
    if (isPyonLoader()) {
        return pyonLoaderConfig.storedTheme;
    } else if (isVendettaLoader()) {
        const themeProp = vendettaLoaderConfig!!.features.themes?.prop;
        if (!themeProp) return null;
        // @ts-ignore
        return globalThis[themeProp] || null;
    }

    return null;
}

export function getThemeFilePath() {
    if (isPyonLoader()) {
        return "pyoncord/current-theme.json"
    } else if (isVendettaLoader()) {
        return "vendetta_theme.json";
    }

    return null;
}

export function isReactDevToolsPreloaded() {
    if (isPyonLoader()) return false;
    else if (isVendettaLoader()) {
        return vendettaLoaderConfig!!.features.devtools != null;
    }

    return false;
}

export function getReactDevToolsProp(): string | null {
    if (!isReactDevToolsPreloaded()) return null;

    if (isVendettaLoader()) {
        return vendettaLoaderConfig!!.features.devtools!!.prop;
    }

    return null;
}

export function getReactDevToolsVersion() {
    if (!isReactDevToolsPreloaded()) return null;

    if (isVendettaLoader()) {
        return vendettaLoaderConfig!!.features.devtools!!.version
    }

    return null;
}

export function isSysColorsSupported() {
    if (isPyonLoader()) return pyonLoaderConfig.isSysColorsSupported;
    else if (isVendettaLoader()) {
        return vendettaLoaderConfig!!.features.syscolors != null;
    }

    return false;
}

export function getSysColors() {
    if (!isSysColorsSupported()) return null;
    if (isPyonLoader()) {
        return pyonLoaderConfig.sysColors;
    } else if (isVendettaLoader()) {
        return vendettaLoaderConfig!!.features.syscolors!!.prop;
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
