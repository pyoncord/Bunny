import { getFindProxyInfo } from "@metro/proxy";
import {
    after as _after,
    before as _before,
    instead as _instead
} from "spitroast";

type ParametersAfterOneArgs<F> = F extends (x: any, y: any, ...args: infer P) => unknown ? P : never;
type ProxyPatchParameters<T, P> = [func: string, parent: [P, (t: P) => any], ...args: ParametersAfterOneArgs<T>];

function shim<T extends (func: string, parent: any, ...args: ParametersAfterOneArgs<T>) => any>(fn: T) {
    function shimmed(this: any, ...args: Parameters<T>) {
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
    }

    shimmed.proxy = function proxyPatch<P>(this: any, ...args: ProxyPatchParameters<T, P>) {
        const [target, resolve] = args[1];
        const proxyInfo = getFindProxyInfo(target);
        if (!proxyInfo) {
            args[1] = resolve(target);
            return shimmed(...args as unknown as Parameters<T>);
        }

        let cancel = false;
        let unpatch = () => cancel = true;
        proxyInfo.getExports(exp => {
            if (cancel) return;
            args[1] = resolve(exp);
            unpatch = shimmed(...args as unknown as Parameters<T>);
        });

        return unpatch;
    };

    return shimmed;
}

export const after = shim(_after);
export const before = shim(_before);
export const instead = shim(_instead);

/** @internal */
export default { after, before, instead };
