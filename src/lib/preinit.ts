// Hoist required modules

import { isThemeSupported } from "./loader";

// This used to be in filters.ts, but things became convoluted
const basicFind = (filter: (m: any) => any | string) => {
    for (const key in window.modules) {
        const exp = window.modules[key]?.publicModule.exports;
        if (exp && filter(exp)) return exp;
    }
}

// Hoist React on window
window.React = basicFind(m => m.createElement) as typeof import("react");

// Export ReactNative
export const ReactNative = basicFind(m => m.AppRegistry) as typeof import("react-native");

// Export chroma.js
export const chroma = basicFind(m => m.brewer) as typeof import("chroma-js");

// Themes
if (isThemeSupported()) {
    try {
        require("@lib/themes").initThemes();
    } catch (e) {
        console.error("[Vendetta] Failed to initialize themes...", e);
    }
}