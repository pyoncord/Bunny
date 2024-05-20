import { registerModuleFindCacheId, registerModuleFindFinished } from "./caches";
import { getModules } from "./modules";
import { FilterFn } from "./utils";

function testExports<A extends unknown[]>(moduleExports: any, moduleId: number, filter: FilterFn<A>) {
    if (moduleExports.default && moduleExports.__esModule && filter(moduleExports.default, moduleId))
        return moduleExports.default;
    if (filter(moduleExports, moduleId))
        return moduleExports;
}

/**
 * Returns the exports of the first module where filter returns truthy, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function find<A extends unknown[]>(filter: FilterFn<A>) {
    for (const [id, moduleExports] of getModules(filter.serialized, false)) {
        const testedExports = testExports(moduleExports, id, filter);
        if (testedExports !== undefined) {
            registerModuleFindCacheId(filter.serialized, id, false);
            return testedExports;
        }
    }

    registerModuleFindFinished(filter.serialized);
}

/**
 * Returns the exports of all modules where filter returns truthy.
 * @param filter findAll calls filter once for each enumerable module's exports, adding the exports to the returned array when filter returns a thruthy value.
 */
export function findAll<A extends unknown[]>(filter: FilterFn<A>) {
    const foundExports: any[] = [];

    for (const [id, moduleExports] of getModules(filter.serialized, true)) {
        const testedExports = testExports(moduleExports, id, filter);
        if (testedExports !== undefined) {
            foundExports.push(testedExports);
            registerModuleFindCacheId(filter.serialized, id, true);
        }
    }

    registerModuleFindFinished(filter.serialized);
    return foundExports;
}
