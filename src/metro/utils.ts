import { proxyLazy } from "@lib/utils/lazy";

import { byDisplayName, byFilePath, byName, byProps, byStoreName, byTypeName } from "./filters";
import { findAllExports, findExports } from "./finders";
import { FilterCheckDef, FilterDefinition, ModuleExports } from "./types";

export function createFilterDefinition<A extends unknown[]>(
    fn: FilterCheckDef<A>,
    uniqMaker: (args: A) => string
): FilterDefinition<A> {
    function createHolder<T extends Function>(func: T, args: A, raw: boolean) {
        return Object.assign(func, {
            filter: fn,
            raw,
            args,
            uniq: [
                raw && "raw::",
                uniqMaker(args)
            ].filter(Boolean).join("")
        });
    }

    const curry = (raw: boolean) => (...args: A) => {
        return createHolder((m: ModuleExports, id: number, defaultCheck: boolean) => {
            return fn(args, m, id, defaultCheck);
        }, args, raw);
    };

    return Object.assign(curry(false), {
        byRaw: curry(true),
        uniqMaker
    });
}

export function createSimpleFilter(
    filter: (m: ModuleExports) => boolean,
    uniq: string
) {
    return createFilterDefinition(
        (_, m) => filter(m),
        () => `dynamic::${uniq}`
    )();
}

export const findByProps = (...props: string[]) => findExports(byProps(...props));
export const findByPropsLazy = (...props: string[]) => proxyLazy(() => findByProps(...props));
export const findByPropsAll = (...props: string[]) => findAllExports(byProps(...props));

export const findByName = (name: string, expDefault = true) => findExports(expDefault ? byName(name) : byName.byRaw(name));
export const findByNameLazy = (name: string, expDefault = true) => proxyLazy(() => findByName(name, expDefault));
export const findByNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byName(name) : byName.byRaw(name));

export const findByDisplayName = (name: string, expDefault = true) => findExports(expDefault ? byDisplayName(name) : byDisplayName.byRaw(name));
export const findByDisplayNameLazy = (name: string, expDefault = true) => proxyLazy(() => findByDisplayName(name, expDefault));
export const findByDisplayNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byDisplayName(name) : byDisplayName.byRaw(name));

export const findByTypeName = (name: string, expDefault = true) => findExports(expDefault ? byTypeName(name) : byTypeName.byRaw(name));
export const findByTypeNameLazy = (name: string, expDefault = true) => proxyLazy(() => findByTypeName(name, expDefault));
export const findByTypeNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byTypeName(name) : byTypeName.byRaw(name));

export const findByStoreName = (name: string) => findExports(byStoreName(name));
export const findByStoreNameLazy = (name: string) => proxyLazy(() => findByStoreName(name));

export const findByFilePath = (path: string) => findExports(byFilePath(path));
export const findByFilePathLazy = (path: string) => proxyLazy(() => findByFilePath(path));


