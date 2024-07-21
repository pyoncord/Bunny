declare global {
        type React = typeof import("react");
        var SkiaApi: typeof import("@shopify/react-native-skia").Skia;

        // ReactNative/Hermes globals
        var globalEvalWithSourceUrl: (script: string, sourceURL: string) => any;
        var nativePerformanceNow: typeof performance.now;
        var nativeModuleProxy: Record<string, Record<string, any> | null>;

        interface Window {
                [key: string]: any;
                vendetta: any;
                bunny: typeof import("@lib");
        }
}

export { };
