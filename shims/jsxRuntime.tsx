import { getFactoryOfProxy } from "@lib/utils/lazy";
import { findByPropsProxy } from "@metro/utils";

const jsxRuntime = findByPropsProxy("jsx", "jsxs", "Fragment");

function unproxyFirstArg<T>(args: T[]) {
    const factory = getFactoryOfProxy(args[0]);
    if (factory) args[0] = factory();
    return args;
}

export const Fragment = Symbol.for("react.fragment");
export const jsx = (...args: any[]) => jsxRuntime.jsx(...unproxyFirstArg(args));
export const jsxs = (...args: any[]) => jsxRuntime.jsxs(...unproxyFirstArg(args));
