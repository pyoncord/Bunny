import { byDisplayName, byName, byProps, byStoreName, byTypeName } from "./filters";
import { find, findAll } from "./finders";

export const findByProps = (...props: string[]) => find(byProps(...props));
export const findByPropsAll = (...props: string[]) => findAll(byProps(...props));

export const findByName = (name: string, expDefault = true) => find(expDefault ? byName(name) : byName.byDefault(name));
export const findByNameAll = (name: string, expDefault = true) => findAll(expDefault ? byName(name) : byName.byDefault(name));

export const findByDisplayName = (name: string, expDefault = true) => find(expDefault ? byDisplayName(name) : byDisplayName.byDefault(name));
export const findByDisplayNameAll = (name: string, expDefault = true) => findAll(expDefault ? byDisplayName(name) : byDisplayName.byDefault(name));

export const findByTypeName = (name: string, expDefault = true) => find(expDefault ? byTypeName(name) : byTypeName.byDefault(name));
export const findByTypeNameAll = (name: string, expDefault = true) => findAll(expDefault ? byTypeName(name) : byTypeName.byDefault(name));

export const findByStoreName = (name: string) => find(byStoreName(name));
