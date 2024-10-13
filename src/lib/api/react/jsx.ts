import { after } from "@lib/api/patcher";
import { findByPropsLazy } from "@metro";

type Callback = (Component: any, ret: JSX.Element) => JSX.Element;
const callbacks = new Map<string, Callback[]>();

const jsxRuntime = findByPropsLazy("jsx", "jsxs");

export function onJsxCreate(Component: string, callback: Callback) {
    if (!callbacks.has(Component)) callbacks.set(Component, []);
    callbacks.get(Component)!.push(callback);
}

export function deleteJsxCreate(Component: string, callback: Callback) {
    if (!callbacks.has(Component)) return;
    const cbs = callbacks.get(Component)!;
    cbs.splice(cbs.indexOf(callback), 1);
    if (cbs.length === 0) callbacks.delete(Component);
}

/**
 * @internal
 */
export function patchJsx() {
    const callback = ([Component]: unknown[], ret: JSX.Element) => {
        // The check could be more complex, but this is fine for now to avoid overhead
        if (typeof Component === "function" && callbacks.has(Component.name)) {
            const cbs = callbacks.get(Component.name)!;
            for (const cb of cbs) {
                const _ret = cb(Component, ret);
                if (_ret !== undefined) ret = _ret;
            }
            return ret;
        }
    };

    const patches = [
        after("jsx", jsxRuntime, callback),
        after("jsxs", jsxRuntime, callback)
    ];

    return () => patches.forEach(unpatch => unpatch());
}
