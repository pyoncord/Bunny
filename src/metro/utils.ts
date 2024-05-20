import { byDisplayName, byFilePath, byName, byProps, byStoreName, byTypeName } from "./filters";
import { findAllExports, findExports } from "./finders";
import { FilterCheckDef, FilterDefinition, ModuleExports } from "./types";

export function createFilterDefinition<A extends unknown[]>(
    fn: FilterCheckDef<A>,
    uniqMaker: (args: A) => string
): FilterDefinition<A> {
    function createHolder<T extends Function>(func: T, args: A, defaultFilter: boolean) {
        return Object.assign(func, {
            filter: fn,
            defaultFilter,
            args,
            uniq: [
                defaultFilter && "default::",
                uniqMaker(args)
            ].filter(Boolean).join("")
        });
    }

    const curry = (defaultFilter: boolean) => (...args: A) => {
        return createHolder((m: ModuleExports, id: number, defaultCheck: boolean) => {
            return fn(args, m, id, defaultCheck);
        }, args, defaultFilter);
    };

    return Object.assign(curry(false), {
        byDefault: curry(true),
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
export const findByPropsAll = (...props: string[]) => findAllExports(byProps(...props));

export const findByName = (name: string, expDefault = true) => findExports(expDefault ? byName(name) : byName.byDefault(name));
export const findByNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byName(name) : byName.byDefault(name));

export const findByDisplayName = (name: string, expDefault = true) => findExports(expDefault ? byDisplayName(name) : byDisplayName.byDefault(name));
export const findByDisplayNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byDisplayName(name) : byDisplayName.byDefault(name));

export const findByTypeName = (name: string, expDefault = true) => findExports(expDefault ? byTypeName(name) : byTypeName.byDefault(name));
export const findByTypeNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byTypeName(name) : byTypeName.byDefault(name));

export const findByStoreName = (name: string) => findExports(byStoreName(name));
export const findByFilePath = (path: string) => findExports(byFilePath(path));
