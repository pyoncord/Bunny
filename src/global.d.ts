import { MetroModules } from "./lib/metro/filters";

declare global {
    type React = typeof import("react");
    const __vendettaVersion: string;

    interface Window {
        [key: string]: any;
        modules: MetroModules;
        vendetta: any;
        React: typeof import("react");
    }
}

export {};
