import { instead } from "@lib/api/patcher";
import type { Metro } from "@metro/types";
import { metroRequire, modules } from "@metro/utils";

export type PropIntellisense<P extends PropertyKey> = Record<P, any> & Record<PropertyKey, any>;
export type PropsFinder = <T extends PropertyKey>(...props: T[]) => PropIntellisense<T>;
export type PropsFinderAll = <T extends PropertyKey>(...props: T[]) => PropIntellisense<T>[];

/** Makes the module associated with the specified ID non-enumberable. */
function blacklistModule(id: Metro.ModuleID) {
    Object.defineProperty(modules, id, { enumerable: false });
}

const functionToString = Function.prototype.toString;

for (const id in modules) {
    const metroModule = modules[id];

    if (metroModule!.factory) {
        instead("factory", metroModule, ((args: Parameters<Metro.FactoryFn>, origFunc: Metro.FactoryFn) => {
            const { 1: metroRequire, 4: moduleObject } = args;

            args[2 /* metroImportDefault */] = id => {
                const exps = metroRequire(id);
                return exps && exps.__esModule ? exps.default : exps;
            };

            args[3 /* metroImportAll */] = id => {
                const exps = metroRequire(id);
                if (exps && exps.__esModule) return exps;

                const importAll: Record<string, any> = {};
                if (exps) Object.assign(importAll, exps);
                importAll.default = exps;
                return importAll;
            };

            origFunc(...args);
            if (moduleObject.exports) onModuleRequire(moduleObject.exports);
        }) as any); // If only spitroast had better types
    }
}

// Blacklist any "bad-actor" modules, e.g. the dreaded null proxy, the window itself, or undefined modules
for (const id in modules) {
    const moduleExports = requireModule(id);

    if (!moduleExports || moduleExports === window || moduleExports["Revenge EOL when?"] === null)
        blacklistModule(id);
}

let patchedInspectSource = false;

function onModuleRequire(moduleExports: any) {
    // Temporary
    moduleExports.initSentry &&= () => undefined;
    if (moduleExports.default?.track && moduleExports.default.trackMaker)
        moduleExports.default.track = () => Promise.resolve();

    // There are modules registering the same native component
    if (moduleExports?.default?.name === "requireNativeComponent") {
        instead("default", moduleExports, (args, origFunc) => {
            try {
                return origFunc(...args);
            } catch {
                return args[0];
            }
        });
    }

    // Hook DeveloperExperimentStore
    if (moduleExports?.default?.constructor?.displayName === "DeveloperExperimentStore") {
        moduleExports.default = new Proxy(moduleExports.default, {
            get(target, property, receiver) {
                if (property === "isDeveloper") {
                    // Hopefully won't explode accessing it here :3
                    const { settings } = require("@lib/settings");
                    return settings.enableDiscordDeveloperSettings ?? false;
                }

                return Reflect.get(target, property, receiver);
            }
        });
    }

    // Funny infinity recursion caused by a race condition
    if (!patchedInspectSource && window["__core-js_shared__"]) {
        const inspect = (f: unknown) => typeof f === "function" && functionToString.apply(f, []);
        window["__core-js_shared__"].inspectSource = inspect;
        patchedInspectSource = true;
    }
}

const noopHandler = () => undefined;

function requireModule(id: Metro.ModuleID) {
    if (modules[id]!.isInitialized) return metroRequire(id);

    // Disable Internal Metro error reporting logic
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(noopHandler);

    let moduleExports;
    try {
        moduleExports = metroRequire(id);
    } catch {
        moduleExports = undefined;
    }

    // Done initializing! Now, revert our hacks
    ErrorUtils.setGlobalHandler(originalHandler);

    return moduleExports;
}

function* getModuleExports() {
    yield require("@metro/polyfills/redesign");

    for (const id in modules) {
        yield requireModule(id);
    }
}

type ExportsFilter = (moduleExports: any) => unknown;

function testExports(moduleExports: any, filter: ExportsFilter) {
    if (moduleExports.default && moduleExports.__esModule && filter(moduleExports.default))
        return moduleExports.default;
    if (filter(moduleExports))
        return moduleExports;
}

/**
 * Returns the exports of the first module where filter returns truthy, and undefined otherwise.
 * @param filter find calls filter once for each enumerable module's exports until it finds one where filter returns a thruthy value.
 */
export function find(filter: ExportsFilter) {
    for (const moduleExports of getModuleExports()) {
        const testedExports = testExports(moduleExports, filter);
        if (testedExports !== undefined)
            return testedExports;
    }
}

/**
 * Returns the exports of all modules where filter returns truthy.
 * @param filter findAll calls filter once for each enumerable module's exports, adding the exports to the returned array when filter returns a thruthy value.
 */
export function findAll(filter: ExportsFilter) {
    const foundExports: any[] = [];
    for (const moduleExports of getModuleExports()) {
        const testedExports = testExports(moduleExports, filter);
        if (testedExports !== undefined)
            foundExports.push(testedExports);
    }
    return foundExports;
}

const propsFilter = (props: PropertyKey[]) =>
    (exps: any) => props.every(p => exps[p] !== undefined);
const nameFilter = (name: string, defaultExp: boolean) => defaultExp
    ? (exps: any) => exps?.name === name
    : (exps: any) => exps?.default?.name === name;
const dNameFilter = (displayName: string, defaultExp: boolean) => defaultExp
    ? (exps: any) => exps?.displayName === displayName
    : (exps: any) => exps?.default?.displayName === displayName;
const tNameFilter = (typeName: string, defaultExp: boolean) => defaultExp
    ? (exps: any) => exps?.type?.name === typeName
    : (exps: any) => exps?.default?.type?.name === typeName;
const storeFilter = (name: string) =>
    (exps: any) => exps.getName && exps.getName.length === 0 && exps.getName() === name;

export const findByProps: PropsFinder = (...props) => find(propsFilter(props));
export const findByPropsAll: PropsFinderAll = (...props) => findAll(propsFilter(props));
export const findByName = (name: string, defaultExp = true) => find(nameFilter(name, defaultExp));
export const findByNameAll = (name: string, defaultExp = true) => findAll(nameFilter(name, defaultExp));
export const findByDisplayName = (displayName: string, defaultExp = true) => find(dNameFilter(displayName, defaultExp));
export const findByDisplayNameAll = (displayName: string, defaultExp = true) => findAll(dNameFilter(displayName, defaultExp));
export const findByTypeName = (typeName: string, defaultExp = true) => find(tNameFilter(typeName, defaultExp));
export const findByTypeNameAll = (typeName: string, defaultExp = true) => findAll(tNameFilter(typeName, defaultExp));
export const findByStoreName = (name: string) => find(storeFilter(name));
