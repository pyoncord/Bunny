import { Metro } from "@lib/metro/types";

declare global {
    var React: typeof import("react");

    interface Window {
        [key: string]: any;
        modules: Metro.ModuleList;
        vendetta: any;
        bunny: typeof import("@lib");
        React: typeof import("react");
    }
}

export { };
