import { getFindProxyInfo } from "@metro/proxy";
import {
    after as _after,
    before as _before,
    instead as _instead
} from "spitroast";

function shim<T extends (...args: any) => any>(fn: T) {
    return function shimmed(this: any, ...args: Parameters<T>) {
        const proxyInfo = getFindProxyInfo(args[1]);
        if (proxyInfo && !proxyInfo.cache && proxyInfo.indexed) {
            let cancel = false;
            let unpatch = () => cancel = true;
            proxyInfo.subscribe(exp => {
                if (cancel) return;
                args[1] = exp;
                unpatch = fn.apply(this, args);
            });

            return () => unpatch();
        }
        return fn.apply(this, args);
    };
}

export const after = shim(_after);
export const before = shim(_before);
export const instead = shim(_instead);

/** @internal */
export default { after, before, instead };
