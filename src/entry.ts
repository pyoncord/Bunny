import { instead } from "spitroast";
import { version } from "bunny-build";

// @ts-ignore - shut up fr
globalThis.window = globalThis;

const init = (async () => {
    try {
        // This logs in the native logging implementation, e.g. logcat
        console.log("Hello from Bunny! Pyon!");
        
        // Make 'freeze' and 'seal' do nothing
        Object.freeze = Object.seal = Object;

        await import(".").then((m) => m.default());
    } catch (e) {
        const { ClientInfoManager } = require("@lib/native/modules");
        const stack = e instanceof Error ? e.stack : undefined;

        console.log(stack ?? e?.toString?.() ?? e);
        alert([
            "Failed to load Bunny!\n",
            `Build Number: ${ClientInfoManager.Build}`,
            `Bunny: ${version}`,
            stack || e?.toString?.(),
        ].join("\n"));
    }
});

// @ts-ignore
if (typeof globalThis.__r !== "undefined") {
    init();
} else {
    // We hold calls from the native side
    function onceIndexRequired(originalRequire: any) {
        const batchedBridge = window.__fbBatchedBridge;

        const callQueue = new Array<any>;
        const unpatch = instead("callFunctionReturnFlushedQueue", batchedBridge, (args, orig) => {
            if (args[0] === "AppRegistry" || !batchedBridge.getCallableModule(args[0])) {
                callQueue.push(args);
                return batchedBridge.flushedQueue();
            }

            return orig.apply(batchedBridge, args);
        });

        const startDiscord = () => {
            init();
            unpatch();
            originalRequire(0);

            callQueue.forEach(arg => 
                batchedBridge.getCallableModule(arg[0]) 
                && batchedBridge.__callFunction(...arg));
        };

        startDiscord();
    }
    
    var _requireFunc: any; // We can't set properties to 'this' during __r set for some reason

    Object.defineProperties(globalThis, {
        __r: {
            configurable: true,
            get: () => _requireFunc,
            set(v) {
                _requireFunc = function patchedRequire(a: number) {
                    // Initializing index.ts(x)
                    if (a === 0) {
                        onceIndexRequired(v);
                        _requireFunc = v;
                    } else return v(a);
                }
            }
        },
        __d: {
            configurable: true,
            get() {
                // @ts-ignore - I got an error where 'Object' is undefined *sometimes*, which is literally never supposed to happen
                if (window.Object && !window.modules) {
                    window.modules = window.__c?.();
                }
                return this.value;
            },
            set(v) { this.value = v }
        }
    });
}