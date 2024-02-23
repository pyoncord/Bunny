import { createFileBackend, createMMKVBackend, createStorage, wrapSync } from "@lib/storage";
import { getLoaderConfigPath } from "./loader";

export interface Settings {
    debuggerUrl: string;
    developerSettings: boolean;
    safeMode?: {
        enabled: boolean;
        currentThemeId?: string;
    };
}

export interface LoaderConfig {
    customLoadUrl: {
        enabled: boolean;
        url: string;
    };
    loadReactDevTools: boolean;
}

export default wrapSync(createStorage<Settings>(createMMKVBackend("VENDETTA_SETTINGS")));

export const loaderConfig = wrapSync(createStorage<LoaderConfig>(
    createFileBackend(getLoaderConfigPath(), {
        customLoadUrl: {
            enabled: false,
            url: "http://localhost:4040/bunny.js"
        }
    })
));
