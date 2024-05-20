import { getFuncUniqCall, registerModuleFindCacheId } from "./caches";
import { FilterFn } from "./filters";
import { getModules } from "./modules";

function testExports<A extends unknown[]>(moduleExports: any, filter: FilterFn<A>) {
    if (moduleExports.default && moduleExports.__esModule && filter(moduleExports.default))
        return moduleExports.default;
    if (filter(moduleExports))
        return moduleExports;
}

/**
 * Returns the exports of the first module where filter returns truthy, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function find<A extends unknown[]>(filter: FilterFn<A>) {
    const uniq = filter.serialized || getFuncUniqCall();

    for (const [id, moduleExports] of getModules(uniq, false)) {
        const testedExports = testExports(moduleExports, filter);
        if (testedExports !== undefined) {
            registerModuleFindCacheId(uniq, id, false);
            return testedExports;
        }
    }
}

/**
 * Returns the exports of all modules where filter returns truthy.
 * @param filter findAll calls filter once for each enumerable module's exports, adding the exports to the returned array when filter returns a thruthy value.
 */
export function findAll<A extends unknown[]>(filter: FilterFn<A>) {
    const foundExports: any[] = [];
    const uniq = filter.serialized || getFuncUniqCall();

    for (const [id, moduleExports] of getModules(uniq, true)) {
        const testedExports = testExports(moduleExports, filter);
        if (testedExports !== undefined) {
            foundExports.push(testedExports);
            registerModuleFindCacheId(uniq, id, true);
        }
    }
    return foundExports;
}
