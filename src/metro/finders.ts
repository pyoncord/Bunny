import { getCacherForUniq } from "./caches";
import { getModules, requireModule } from "./modules";
import { FilterFn } from "./types";

function testExports<A extends unknown[]>(moduleExports: any, moduleId: number, filter: FilterFn<A>) {
    if (moduleExports.default && moduleExports.__esModule && filter(moduleExports.default, moduleId, true)) {
        return [filter.defaultFilter ? moduleExports : moduleExports.default, !filter.defaultFilter];
    }

    if (!filter.defaultFilter && filter(moduleExports, moduleId, false)) {
        return [moduleExports, false];
    }

    return [];
}

/**
 * Returns the [id, defaultExports] of the first module where filter returns non-undefined, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function findModule<A extends unknown[]>(filter: FilterFn<A>) {
    const { cacheId, finish } = getCacherForUniq(filter.uniq, false);

    for (const [id, moduleExports] of getModules(filter.uniq, false)) {
        const [testedExports, defaultExp] = testExports(moduleExports, id, filter);
        if (testedExports !== undefined) {
            cacheId(id);
            return [id, defaultExp];
        }
    }

    finish();
    return [];
}

/**
 * Returns the id of the first module where filter returns non-undefined, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function findModuleId<A extends unknown[]>(filter: FilterFn<A>) {
    return findModule(filter)?.[0];
}

/**
 * Returns the exports of the first module where filter returns non-undefined, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function findExports<A extends unknown[]>(filter: FilterFn<A>) {
    const [id, defaultExp] = findModule(filter);
    if (defaultExp == null) return;
    return defaultExp ? requireModule(id).default : requireModule(id);
}

/**
 * Returns the [id, defaultExports] of all modules where filter returns non-undefined.
 * @param filter findAll calls filter once for each enumerable module's exports, adding the exports to the returned array when filter returns a thruthy value.
 */
export function findAllModule<A extends unknown[]>(filter: FilterFn<A>) {
    const { cacheId, finish } = getCacherForUniq(filter.uniq, true);
    const foundExports: [id: number, defaultExp: boolean][] = [];

    for (const [id, moduleExports] of getModules(filter.uniq, true)) {
        const [testedExports, defaultExp] = testExports(moduleExports, id, filter);
        if (testedExports !== undefined) {
            foundExports.push([id, defaultExp]);
            cacheId(id);
        }
    }

    finish();
    return foundExports;
}

/**
 * Returns the ids of all modules where filter returns non-undefined.
 * @param filter findAll calls filter once for each enumerable module's exports, adding the exports to the returned array when filter returns a thruthy value.
 */
export function findAllModuleId<A extends unknown[]>(filter: FilterFn<A>) {
    return findAllModule(filter).map(e => e[0]);
}

/**
 * Returns the ids of all exports where filter returns non-undefined.
 * @param filter findAll calls filter once for each enumerable module's exports, adding the exports to the returned array when filter returns a thruthy value.
 */
export function findAllExports<A extends unknown[]>(filter: FilterFn<A>) {
    return findAllModule(filter).map(e => {
        const [id, defaultExp] = e;
        if (defaultExp == null) return;
        return defaultExp ? requireModule(id).default : requireModule(id);
    });
}
