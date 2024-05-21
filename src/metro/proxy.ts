import { proxyLazy } from "@lib/utils/lazy";

import { getMetroCache } from "./caches";
import { filterExports, findExports } from "./finders";
import { requireModule, subscribeModule } from "./modules";
import type { FilterFn } from "./types";

// TODO: "Find info" sounds too meh
const findInfoSym = Symbol.for("bunny.metro.findInfo");

const proxyInfoMap = new WeakMap<{}, FindProxyInfo<any[]>>();

interface FindProxyInfo<A extends unknown[]> {
    filter: FilterFn<A>;
    indexed: boolean;
    moduleId: number | undefined;
    subscribe(cb: (exports: any) => void): () => void;
    unproxy(): any;
    get cache(): any;
}

function getIndexedSingleFind<A extends unknown[]>(filter: FilterFn<A>) {
    const id = Object.keys(getMetroCache().findIndex[filter.uniq]!).filter(k => k !== "_")[0];
    return id ? Number(id) : void 0;
}

function subscribeModuleForFind(proxy: any, callback: (exports: any) => void) {
    const info = getFindProxyInfo(proxy);
    if (!info) throw new Error("Subscribing a module for non-proxy-find");
    if (!info.indexed) throw new Error("Attempting to subscribe to a non-indexed find");

    return subscribeModule(info.moduleId!, () => {
        const [exp] = filterExports(
            requireModule(info.moduleId!),
            info.moduleId!,
            info.filter
        );
        callback(exp);
    });
}

export function getFindProxyInfo<A extends unknown[]>(proxy: any): FindProxyInfo<A> | void {
    return proxyInfoMap.get(proxy) as unknown as FindProxyInfo<A>;
}

export function createFindProxy<A extends unknown[]>(filter: FilterFn<A>) {
    let cache: any = undefined;

    const moduleId = getIndexedSingleFind(filter);
    const info: FindProxyInfo<A> = {
        filter,
        indexed: !!moduleId,
        moduleId,
        subscribe(cb: (exports: any) => void) {
            return subscribeModuleForFind(proxy, cb);
        },
        get cache() {
            return cache;
        },
        unproxy() {
            return cache ??= findExports(filter);
        }
    };

    const proxy = proxyLazy(() => cache ??= findExports(filter));
    proxyInfoMap.set(proxy, info as FindProxyInfo<any>);

    return proxy;
}
