import { MetroModules } from "@lib/metro/filters";
import { BunnyObject } from "@lib/windowObject";

declare global {
    type React = typeof import("react");
    const __vendettaVersion: string;

    interface Window {
        [key: string]: any;
        modules: MetroModules;
        vendetta: any;
        bunny: BunnyObject;
        React: typeof import("react");
    }
}

export {};
