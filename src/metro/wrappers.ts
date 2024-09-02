import { byDisplayName, byFilePath,byName, byProps, byStoreName, byTypeName } from "./filters";
import { findAllExports,findExports } from "./finders";
import { createLazyModule } from "./lazy";

export const findByProps = (...props: string[]) => findExports(byProps(...props));
export const findByPropsLazy = (...props: string[]) => createLazyModule(byProps(...props));
export const findByPropsAll = (...props: string[]) => findAllExports(byProps(...props));

export const findByName = (name: string, expDefault = true) => findExports(expDefault ? byName(name) : byName.byRaw(name));
export const findByNameLazy = (name: string, expDefault = true) => createLazyModule(expDefault ? byName(name) : byName.byRaw(name));
export const findByNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byName(name) : byName.byRaw(name));

export const findByDisplayName = (name: string, expDefault = true) => findExports(expDefault ? byDisplayName(name) : byDisplayName.byRaw(name));
export const findByDisplayNameLazy = (name: string, expDefault = true) => createLazyModule(expDefault ? byDisplayName(name) : byDisplayName.byRaw(name));
export const findByDisplayNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byDisplayName(name) : byDisplayName.byRaw(name));

export const findByTypeName = (name: string, expDefault = true) => findExports(expDefault ? byTypeName(name) : byTypeName.byRaw(name));
export const findByTypeNameLazy = (name: string, expDefault = true) => createLazyModule(expDefault ? byTypeName(name) : byTypeName.byRaw(name));
export const findByTypeNameAll = (name: string, expDefault = true) => findAllExports(expDefault ? byTypeName(name) : byTypeName.byRaw(name));

export const findByStoreName = (name: string) => findExports(byStoreName(name));
export const findByStoreNameLazy = (name: string) => createLazyModule(byStoreName(name));

export const findByFilePath = (path: string, expDefault = false) => findExports(byFilePath(path, expDefault));
export const findByFilePathLazy = (path: string, expDefault = false) => createLazyModule(byFilePath(path, expDefault));
