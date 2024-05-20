declare global {
    var React: typeof import("react");

    interface Window {
        [key: string]: any;
        vendetta: any;
        bunny: typeof import("@lib");
        React: typeof import("react");
    }
}

export { };
