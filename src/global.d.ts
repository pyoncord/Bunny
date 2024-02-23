import { MetroModules } from "@lib/metro/filters";
import { BunnyObject } from "@lib/windowObject";

declare global {
    type React = typeof import("react");

    interface Window {
        [key: string]: any;
        modules: MetroModules;
        vendetta: any;
        bunny: BunnyObject;
        React: typeof import("react");
    }
}

export {};
