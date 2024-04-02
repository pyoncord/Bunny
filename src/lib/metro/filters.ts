import { after, instead } from "@lib/api/patcher";

export type MetroModules = { [id: string]: any; };
export type PropIntellisense<P extends string | symbol> = Record<P, any> & Record<PropertyKey, any>;
export type PropsFinder = <T extends string | symbol>(...props: T[]) => PropIntellisense<T>;
export type PropsFinderAll = <T extends string | symbol>(...props: T[]) => PropIntellisense<T>[];

// Metro global vars
declare var __r: (moduleId: string) => any;
declare var modules: MetroModules;

// Function to blacklist a module, preventing it from being searched again
const blacklist = (id: string) => Object.defineProperty(window.modules, id, {
    value: window.modules[id],
    enumerable: false,
    configurable: true,
    writable: true
});

const functionToString = Function.prototype.toString;

for (const id in window.modules) {
    const moduleDefinition = window.modules[id];

    if (moduleDefinition.factory) {
        after("factory", moduleDefinition, ({ 4: moduleObject }) => {
            if (moduleObject.exports) onModuleRequire(moduleObject.exports);
        });
    }
}


// Blacklist any "bad-actor" modules, e.g. the dreaded null proxy, the window itself, or undefined modules
for (const id in window.modules) {
    const module = requireModule(id);

    if (!module || module === window || module["Revenge EOL when?"] === null) {
        blacklist(id);
        continue;
    }
}

let patchedInspectSource = false;

function onModuleRequire(exports: any) {
    // There are modules registering the same native component
    if (exports?.default?.name === "requireNativeComponent") {
        instead("default", exports, (args, orig) => {
            try {
                return orig(...args);
            } catch {
                return args[0];
            }
        });
    }

    // Hook DeveloperExperimentStore
    if (exports?.default?.constructor?.displayName === "DeveloperExperimentStore") {
        exports.default = new Proxy(exports.default, {
            get: (target, property, receiver) => {
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
        const inspect = (f: Function) => typeof f === "function" && functionToString.apply(f, []);
        window["__core-js_shared__"].inspectSource = inspect;
        patchedInspectSource = true;
    }
}

function requireModule(id: string) {
    if (modules[id].isInitialized) return __r(id);

    // Disable Internal Metro error reporting logic
    const originalHandler = window.ErrorUtils.getGlobalHandler();
    window.ErrorUtils.setGlobalHandler(null);

    try {
        var exports = __r(id); // metroRequire(id);
    } catch {
        var exports = undefined;
    }

    // Done initializing! Now, revert our hacks
    window.ErrorUtils.setGlobalHandler(originalHandler);

    return exports;
}

// Function to filter through modules
const filterModules = (modules: MetroModules, single = false) => (filter: (m: any) => boolean) => {
    const found = [];

    for (const id in modules) {
        const exports = requireModule(id);

        if (exports.default && exports.__esModule && filter(exports.default)) {
            if (single) return exports.default;
            found.push(exports.default);
        }

        if (filter(exports)) {
            if (single) return exports;
            else found.push(exports);
        }
    }

    if (!single) return found;
};

export const find = filterModules(modules, true);
export const findAll = filterModules(modules);

const propsFilter = (props: (string | symbol)[]) => (m: any) => props.every(p => m[p] !== undefined);
const nameFilter = (name: string, defaultExp: boolean) => (defaultExp ? (m: any) => m?.name === name : (m: any) => m?.default?.name === name);
const dNameFilter = (displayName: string, defaultExp: boolean) => (defaultExp ? (m: any) => m?.displayName === displayName : (m: any) => m?.default?.displayName === displayName);
const tNameFilter = (typeName: string, defaultExp: boolean) => (defaultExp ? (m: any) => m?.type?.name === typeName : (m: any) => m?.default?.type?.name === typeName);
const storeFilter = (name: string) => (m: any) => m.getName && m.getName.length === 0 && m.getName() === name;

export const findByProps: PropsFinder = (...props) => find(propsFilter(props));
export const findByPropsAll: PropsFinderAll = (...props) => findAll(propsFilter(props));
export const findByName = (name: string, defaultExp = true) => find(nameFilter(name, defaultExp));
export const findByNameAll = (name: string, defaultExp = true) => findAll(nameFilter(name, defaultExp));
export const findByDisplayName = (displayName: string, defaultExp = true) => find(dNameFilter(displayName, defaultExp));
export const findByDisplayNameAll = (displayName: string, defaultExp = true) => findAll(dNameFilter(displayName, defaultExp));
export const findByTypeName = (typeName: string, defaultExp = true) => find(tNameFilter(typeName, defaultExp));
export const findByTypeNameAll = (typeName: string, defaultExp = true) => findAll(tNameFilter(typeName, defaultExp));
export const findByStoreName = (name: string) => find(storeFilter(name));
