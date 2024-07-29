
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


