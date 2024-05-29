import { proxyLazy } from "@lib/utils/lazy";

import { getMetroCache } from "./caches";
import { findExports } from "./finders";
import { metroModules, subscribeModule } from "./modules";
import type { FilterFn } from "./types";

const proxyContextMap = new WeakMap<any, FindProxyContext<any[]>>();

interface FindProxyContext<A extends unknown[]> {
    filter: FilterFn<A>;
    indexed: boolean;
    moduleId: number | undefined;
    getExports(cb: (exports: any) => void): () => void;
    subscribe(cb: (exports: any) => void): () => void;
    unproxy(): any;
    get cache(): any;
}

function getIndexedSingleFind<A extends unknown[]>(filter: FilterFn<A>) {
    const modulesMap = getMetroCache().findIndex[filter.uniq];
    if (!modulesMap) return;
    const id = Object.keys(modulesMap).filter(k => k[0] !== "_")[0];
    return id ? Number(id) : void 0;
}

function subscribeModuleOfFind(proxy: any, callback: (exports: any) => void) {
    const info = getFindContext(proxy);
    if (!info) throw new Error("Subscribing a module for non-proxy-find");
    if (!info.indexed) throw new Error("Attempting to subscribe to a non-indexed find");

    return subscribeModule(info.moduleId!, () => {
        callback(findExports(info.filter));
    });
}

export function getFindContext<A extends unknown[]>(proxy: any): FindProxyContext<A> | void {
    return proxyContextMap.get(proxy) as unknown as FindProxyContext<A>;
}

export function createFindProxy<A extends unknown[]>(filter: FilterFn<A>) {
    let cache: any = undefined;

    const moduleId = getIndexedSingleFind(filter);
    const context: FindProxyContext<A> = {
        filter,
        indexed: !!moduleId,
        moduleId,
        getExports(cb: (exports: any) => void) {
            if (!moduleId || metroModules[moduleId]?.isInitialized) {
                return cb(this.unproxy()), () => { };
            }
            return this.subscribe(cb);
        },
        subscribe(cb: (exports: any) => void) {
            return subscribeModuleOfFind(proxy, cb);
        },
        get cache() {
            return cache;
        },
        unproxy() {
            cache ??= findExports(filter);
            if (!cache) throw new Error(`${filter.uniq} is ${typeof cache}! (id ${context.moduleId ?? "unknown"})`);
            return cache;
        }
    };

    const proxy = proxyLazy(() => context.unproxy());
    proxyContextMap.set(proxy, context as FindProxyContext<any>);

    return proxy;
}
