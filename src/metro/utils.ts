import { byDisplayName, byFilePath, byName, byProps, byStoreName, byTypeName } from "./filters";
import { find, findAll } from "./finders";

type ModuleExports = any;
type FilterCheckDef<A extends unknown[]> = (args: A, m: any, id: number) => boolean;

export interface FilterFn<A extends unknown[]> {
    (m: any, id: number): boolean;
    filter: FilterCheckDef<A>;
    args: A;
    isDefault: boolean;
    serialized: string;
}

export interface FilterDef<A extends unknown[]> {
    (...args: A): FilterFn<A>;
    byDefault(...args: A): FilterFn<A>;
    serializer(args: A): string;
}

export function createFilterDefinition<A extends unknown[]>(
    fn: FilterCheckDef<A>,
    serializer: (args: A) => string
): FilterDef<A> {
    function createHolder<T extends Function>(func: T, args: A, isDefault: boolean) {
        return Object.assign(func, {
            filter: fn,
            args,
            isDefault,
            serialized: [
                isDefault && "default::",
                serializer(args)
            ].filter(Boolean).join("")
        });
    }

    const curried = (...args: A) => createHolder((m: ModuleExports, id: number) => fn(args, m, id), args, false);
    const curriedDefault = (...args: A) => {
        function filter(m: ModuleExports, id: number) {
            return m.__esModule && m.default ? fn(args, m.default, id) : false;
        }
        return createHolder(filter, args, true);
    };

    return Object.assign(curried, {
        byDefault: curriedDefault,
        serializer
    });
}

export function createSimpleFilter(
    filter: (m: ModuleExports) => boolean,
    id: string
) {
    return createFilterDefinition(
        (_, m) => filter(m),
        () => `dynamic::${id}`
    )();
}

export const findByProps = (...props: string[]) => find(byProps(...props));
export const findByPropsAll = (...props: string[]) => findAll(byProps(...props));

export const findByName = (name: string, expDefault = true) => find(expDefault ? byName(name) : byName.byDefault(name));
export const findByNameAll = (name: string, expDefault = true) => findAll(expDefault ? byName(name) : byName.byDefault(name));

export const findByDisplayName = (name: string, expDefault = true) => find(expDefault ? byDisplayName(name) : byDisplayName.byDefault(name));
export const findByDisplayNameAll = (name: string, expDefault = true) => findAll(expDefault ? byDisplayName(name) : byDisplayName.byDefault(name));

export const findByTypeName = (name: string, expDefault = true) => find(expDefault ? byTypeName(name) : byTypeName.byDefault(name));
export const findByTypeNameAll = (name: string, expDefault = true) => findAll(expDefault ? byTypeName(name) : byTypeName.byDefault(name));

export const findByStoreName = (name: string) => find(byStoreName(name));
export const findByFilePath = (path: string) => find(byFilePath(path));
