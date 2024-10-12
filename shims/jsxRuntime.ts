import { getProxyFactory } from "@lib/utils/lazy";
import { findByPropsLazy } from "@metro/wrappers";

const jsxRuntime = findByPropsLazy("jsx", "jsxs", "Fragment");

function unproxyFirstArg<T>(args: T[]) {
    if (!args[0]) {
        throw new Error("The first argument (Component) is falsy. Ensure that you are passing a valid component.");
    }

    const factory = getProxyFactory(args[0]);
    if (factory) args[0] = factory();
    return args;
}

export const Fragment = Symbol.for("react.fragment");
export const jsx = (...args: any[]) => jsxRuntime.jsx(...unproxyFirstArg(args));
export const jsxs = (...args: any[]) => jsxRuntime.jsxs(...unproxyFirstArg(args));
