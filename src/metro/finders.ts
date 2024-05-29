import { getCacherForUniq } from "./caches";
import { getModules, requireModule } from "./modules";
import { FilterFn } from "./types";

function filterExports<A extends unknown[]>(
    moduleExports: any,
    moduleId: number, filter:
        FilterFn<A>
): [any, boolean] | [void, false] {
    if (moduleExports.default && moduleExports.__esModule && filter(moduleExports.default, moduleId, true)) {
        return [filter.raw ? moduleExports : moduleExports.default, !filter.raw];
    }

    if (!filter.raw && filter(moduleExports, moduleId, false)) {
        return [moduleExports, false];
    }

    return [undefined, false];
}

/**
 * Returns the [id, defaultExports] of the first module where filter returns non-undefined, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function findModule<A extends unknown[]>(filter: FilterFn<A>) {
    const { cacheId, finish } = getCacherForUniq(filter.uniq, false);

    for (const [id, moduleExports] of getModules(filter.uniq, false)) {
        const [testedExports, defaultExp] = filterExports(moduleExports, id, filter);
        if (testedExports !== undefined) {
            cacheId(id, testedExports);
            return [id, defaultExp];
        }
    }

    finish(true);
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
    if (id == null) return;
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
        const [testedExports, defaultExp] = filterExports(moduleExports, id, filter);
        if (testedExports !== undefined) {
            foundExports.push([id, defaultExp]);
            cacheId(id, testedExports);
        }
    }

    finish(foundExports.length === 0);
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
    return findAllModule(filter).map(ret => {
        if (!ret.length) return;
        const [id, defaultExp] = ret;
        return defaultExp ? requireModule(id).default : requireModule(id);
    });
}
