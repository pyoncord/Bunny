import { instead } from "@lib/api/patcher";


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

// Blacklist any "bad-actor" modules, e.g. the dreaded null proxy, the window itself, or undefined modules
for (const id in window.modules) {
    const module = window.modules[id]?.publicModule?.exports;

    if (!module || module === window || module.proxygone === null) {
        blacklist(id);
        continue;
    }
}

const checked = new WeakSet();
const onModuleCheck = (exports: any) => {
    if (typeof exports !== "object" || checked.has(exports)) return;
    checked.add(exports);

    if (exports?.default?.name === "requireNativeComponent") {
        instead("default", exports, (args, orig) => {
            try {
                return orig(...args);
            } catch {
                return args[0];
            }
        });
    }
};

function maybeInitializeModule(id: string) {
    if (modules[id].isInitialized) return;

    try {
        // There's a dum Function.prototype.toString polyfill somewhere in Discord's codebase
        const orig = Function.prototype.toString;
        Object.defineProperty(Function.prototype, "toString", {
            value: orig,
            configurable: true,
            writable: false
        });

        // Disable Internal Metro error reporting logic
        const originalHandler = window.ErrorUtils.getGlobalHandler();
        window.ErrorUtils.setGlobalHandler(null);

        __r(id); // metroRequire(id);

        // Done initializing! Now, revert our hacks
        window.ErrorUtils.setGlobalHandler(originalHandler);
        Object.defineProperty(Function.prototype, "toString", {
            value: orig,
            configurable: true,
            writable: true
        });
    } catch { }

}

// Function to filter through modules
const filterModules = (modules: MetroModules, single = false) => (filter: (m: any) => boolean) => {
    const found = [];

    for (const id in modules) {
        const module = modules[id]?.publicModule?.exports;

        maybeInitializeModule(id);

        if (!module) {
            blacklist(id);
            continue;
        }

        onModuleCheck(module);

        if (module.default && module.__esModule && filter(module.default)) {
            if (single) return module.default;
            found.push(module.default);
        }

        if (filter(module)) {
            if (single) return module;
            else found.push(module);
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
