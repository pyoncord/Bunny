
type Indexable = Record<PropertyKey, any>;
type ModuleExports = any;

type FilterCheckDef<A extends unknown[]> = <M extends Indexable>(args: A, m: M) => boolean;

export interface FilterFn<A extends unknown[]> {
    (m: any): boolean;
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

    const curried = (...args: A) => createHolder((m: ModuleExports) => fn(args, m), args, false);
    const curriedDefault = (...args: A) => {
        function filter(m: ModuleExports) {
            return m.__esModule && m.default ? fn(args, m.default) : false;
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


export const byProps = createFilterDefinition<string[]>(
    (props, m) => props.length === 0 ? m[props[0]] : props.every(p => m[p]),
    props => `pyoncord.metro.byProps(${props.join(",")})`
);

export const byName = createFilterDefinition<[string]>(
    ([name], m) => m.name === name,
    name => `pyoncord.metro.byName(${name})`
);

export const byDisplayName = createFilterDefinition<[string]>(
    ([displayName], m) => m.displayName === displayName,
    name => `pyoncord.metro.byDisplayName(${name})`
);

export const byTypeName = createFilterDefinition<[string]>(
    ([typeName], m) => m.type?.name === typeName,
    name => `pyoncord.metro.byTypeName(${name})`
);

export const byStoreName = createFilterDefinition<[string]>(
    ([name], m) => m.getName?.length === 0 && m.getName() === name,
    name => `pyoncord.metro.byStoreName(${name})`
);

export const byMutableProp = createFilterDefinition<[string]>(
    ([prop], m) => m?.[prop] && !Object.getOwnPropertyDescriptor(m, prop)?.get,
    prop => `pyoncord.metro.byMutableProp(${prop})`
);
