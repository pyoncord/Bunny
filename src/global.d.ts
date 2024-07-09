declare global {
        type React = typeof import("react");
        var SkiaApi: typeof import("@shopify/react-native-skia").Skia;

        interface Window {
                [key: string]: any;
                vendetta: any;
                bunny: typeof import("@lib");
        }
}

export { };
