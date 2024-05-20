import { registerModuleFindCacheId, registerModuleFindFinished } from "./caches";
import { getModules, requireModule } from "./modules";
import { FilterFn } from "./utils";

function testExports<A extends unknown[]>(moduleExports: any, moduleId: number, filter: FilterFn<A>) {
    if (moduleExports.default && moduleExports.__esModule && filter(moduleExports.default, moduleId))
        return [moduleExports.default, true];
    if (filter(moduleExports, moduleId))
        return [moduleExports, false];

    return [];
}

/**
 * Returns the [id, defaultExports] of the first module where filter returns truthy, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function findModule<A extends unknown[]>(filter: FilterFn<A>) {
    for (const [id, moduleExports] of getModules(filter.serialized, false)) {
        const [testedExports, defaultExp] = testExports(moduleExports, id, filter);
        if (testedExports !== undefined) {
            registerModuleFindCacheId(filter.serialized, id, false);
            return [id, defaultExp];
        }
    }

    registerModuleFindFinished(filter.serialized);
    return [];
}

/**
 * Returns the id of the first module where filter returns truthy, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function findModuleId<A extends unknown[]>(filter: FilterFn<A>) {
    return findModule(filter)?.[0];
}

/**
 * Returns the exports of the first module where filter returns truthy, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function findExports<A extends unknown[]>(filter: FilterFn<A>) {
    const [id, defaultExp] = findModule(filter);
    if (defaultExp == null) return;
    return defaultExp ? requireModule(id).default : requireModule(id);
}

/**
 * Returns the [id, defaultExports] of all modules where filter returns truthy.
 * @param filter findAll calls filter once for each enumerable module's exports, adding the exports to the returned array when filter returns a thruthy value.
 */
export function findAllModule<A extends unknown[]>(filter: FilterFn<A>) {
    const foundExports: [id: number, defaultExp: boolean][] = [];

    for (const [id, moduleExports] of getModules(filter.serialized, true)) {
        const [testedExports, defaultExp] = testExports(moduleExports, id, filter);
        if (testedExports !== undefined) {
            foundExports.push([id, defaultExp]);
            registerModuleFindCacheId(filter.serialized, id, true);
        }
    }

    registerModuleFindFinished(filter.serialized);
    return foundExports;
}

/**
 * Returns the ids of all modules where filter returns truthy.
 * @param filter findAll calls filter once for each enumerable module's exports, adding the exports to the returned array when filter returns a thruthy value.
 */
export function findAllModuleId<A extends unknown[]>(filter: FilterFn<A>) {
    return findAllModule(filter).map(e => e[0]);
}

/**
 * Returns the ids of all exports where filter returns truthy.
 * @param filter findAll calls filter once for each enumerable module's exports, adding the exports to the returned array when filter returns a thruthy value.
 */
export function findAllExports<A extends unknown[]>(filter: FilterFn<A>) {
    return findAllModule(filter).map(e => {
        const [id, defaultExp] = e;
        if (defaultExp == null) return;
        return defaultExp ? requireModule(id).default : requireModule(id);
    });
}
