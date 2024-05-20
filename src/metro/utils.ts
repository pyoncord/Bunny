import { byDisplayName, byName, byProps, byStoreName, byTypeName } from "./filters";
import { find } from "./finders";

export const findByProps = (...props: string[]) => find(byProps(...props));
export const findByName = (name: string, expDefault = true) => find(expDefault ? byName(name) : byName.byDefault(name));
export const findByDisplayName = (name: string, expDefault = true) => find(expDefault ? byDisplayName(name) : byDisplayName.byDefault(name));
export const findByTypeName = (name: string, expDefault = true) => find(expDefault ? byTypeName(name) : byTypeName.byDefault(name));
export const findByStoreName = (name: string) => find(byStoreName(name));
