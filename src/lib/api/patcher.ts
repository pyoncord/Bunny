import { getFindContext } from "@metro/proxy";
const {
    after: _after,
    before: _before,
    instead: _instead
} = require("spitroast") as
    // Temporary
    typeof import("../../../node_modules/spitroast");

type ParametersAfterTwoArgs<F> = F extends (x: any, y: any, ...args: infer P) => unknown ? P : never;
type ProxyPatchParameters<T, P> = [func: string, parent: [P, (t: P) => any], ...args: ParametersAfterTwoArgs<T>];

function shim<T extends (func: string, parent: any, ...args: ParametersAfterTwoArgs<T>) => any>(fn: T) {
    function shimmed(this: any, ...args: Parameters<T>) {
        const proxyInfo = getFindContext(args[1]);
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
        const proxyInfo = getFindContext(target);
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
