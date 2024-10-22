import { _colorRef } from "@lib/addons/themes/colors/updater";
import { after, before } from "@lib/api/patcher";
import { findInTree } from "@lib/utils";
import { proxyLazy } from "@lib/utils/lazy";
import { findByProps } from "@metro";

const mmkvStorage = proxyLazy(() => {
    const newModule = findByProps("impl");
    if (typeof newModule?.impl === "object") return newModule.impl;
    return findByProps("storage");
});

export default function patchStorage() {
    const patchedKeys = new Set(["ThemeStore", "SelectivelySyncedUserSettingsStore"]);

    const patches = [
        after("get", mmkvStorage, ([key], ret) => {
            if (!_colorRef.current || !patchedKeys.has(key)) return;

            const state = findInTree(ret._state, s => typeof s.theme === "string");
            if (state) state.theme = _colorRef.key;
        }),
        before("set", mmkvStorage, ([key, value]) => {
            if (!patchedKeys.has(key)) return;

            const json = JSON.stringify(value);
            const lastSetDiscordTheme = _colorRef.lastSetDiscordTheme ?? "darker";
            const replaced = json.replace(
                /"theme":"bn-theme-\d+"/,
                `"theme":${JSON.stringify(lastSetDiscordTheme)}`
            );

            return [key, JSON.parse(replaced)];
        })
    ];

    return () => patches.forEach(p => p());
}
