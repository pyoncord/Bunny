import { metroModules } from "./modules";
import { createFilterDefinition } from "./utils";

export const byProps = createFilterDefinition<string[]>(
    (props, m) => props.length === 0 ? m[props[0]] : props.every(p => m[p]),
    props => `bunny.metro.byProps(${props.join(",")})`
);

export const byName = createFilterDefinition<[string]>(
    ([name], m) => m.name === name,
    name => `bunny.metro.byName(${name})`
);

export const byDisplayName = createFilterDefinition<[string]>(
    ([displayName], m) => m.displayName === displayName,
    name => `bunny.metro.byDisplayName(${name})`
);

export const byTypeName = createFilterDefinition<[string]>(
    ([typeName], m) => m.type?.name === typeName,
    name => `bunny.metro.byTypeName(${name})`
);

export const byStoreName = createFilterDefinition<[string]>(
    ([name], m) => m.getName?.length === 0 && m.getName() === name,
    name => `bunny.metro.byStoreName(${name})`
);

export const byFilePath = createFilterDefinition<[string]>(
    ([path], _, id, defaultCheck) => !defaultCheck && metroModules[id]?.__filePath === path,
    path => `bunny.metro.byFilePath(${path})`
);

export const byMutableProp = createFilterDefinition<[string]>(
    ([prop], m) => m?.[prop] && !Object.getOwnPropertyDescriptor(m, prop)?.get,
    prop => `bunny.metro.byMutableProp(${prop})`
);
