
import { byDisplayName, byFilePath, byName, byProps, byStoreName, byTypeName } from "./filters";
import { findAllExports, findExports } from "./finders";
import { createLazyModule } from "./lazy";
import { FilterCheckDef, FilterDefinition, ModuleExports } from "./types";

export function createFilterDefinition<A extends unknown[]>(
    fn: FilterCheckDef<A>,
    uniqMaker: (args: A) => string
): FilterDefinition<A> {
    function createHolder<T extends Function>(func: T, args: A, raw: boolean) {
        return Object.assign(func, {
            filter: fn,
            raw,
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
export const findByPropsProxy = (...props: string[]) => createLazyModule(byProps(...props));
export const findByPropsAll = (...props: string[]) => findAllExports(byProps(...props));

export const findByName = (name: string, expDefault = true) => findExports(expDefault ? byName(name) : byName.byRaw(name));
export const findByNameProxy = (name: string, expDefault = true) => createLazyModule(expDefault ? byName(name) : byName.byRaw(name));
export const findByNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byName(name) : byName.byRaw(name));

export const findByDisplayName = (name: string, expDefault = true) => findExports(expDefault ? byDisplayName(name) : byDisplayName.byRaw(name));
export const findByDisplayNameProxy = (name: string, expDefault = true) => createLazyModule(expDefault ? byDisplayName(name) : byDisplayName.byRaw(name));
export const findByDisplayNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byDisplayName(name) : byDisplayName.byRaw(name));

export const findByTypeName = (name: string, expDefault = true) => findExports(expDefault ? byTypeName(name) : byTypeName.byRaw(name));
export const findByTypeNameProxy = (name: string, expDefault = true) => createLazyModule(expDefault ? byTypeName(name) : byTypeName.byRaw(name));
export const findByTypeNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byTypeName(name) : byTypeName.byRaw(name));

export const findByStoreName = (name: string) => findExports(byStoreName(name));
export const findByStoreNameProxy = (name: string) => createLazyModule(byStoreName(name));

export const findByFilePath = (path: string) => findExports(byFilePath(path));
export const findByFilePathProxy = (path: string) => createLazyModule(byFilePath(path));

