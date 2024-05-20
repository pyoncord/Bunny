import { getMetroCache } from "@metro/caches";
import { Metro } from "@metro/types";
import { before, instead } from "spitroast";

export const metroModules: Metro.ModuleList = window.modules;
const metroRequire: Metro.Require = window.__r;

const blacklistedIds = new Set<String>();
const noopHandler = () => undefined;
const functionToString = Function.prototype.toString;

let patchedInspectSource = false;
let patchedImportTracker = false;
let _importingModuleId: string | null = null;

/** Makes the module associated with the specified ID non-enumberable. */
function blacklistModule(id: string) {
    Object.defineProperty(metroModules, id, { enumerable: false });
    blacklistedIds.add(id);
}

function isBadExports(exports: any) {
    return !exports || exports === window || exports["<!@ pylix was here :fuyusquish: !@>"] === null;
}

for (const id in metroModules) {
    const metroModule = metroModules[id];

    if (metroModule!.factory) {
        instead("factory", metroModule, ((args: Parameters<Metro.FactoryFn>, origFunc: Metro.FactoryFn) => {
            _importingModuleId = id;
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
            if (!isBadExports(moduleObject.exports)) {
                onModuleRequire(moduleObject.exports, id);
            } else {
                blacklistModule(id);
            }
            _importingModuleId = null;
        }) as any); // If only spitroast had better types
    }
}

function onModuleRequire(moduleExports: any, id: Metro.ModuleID) {
    // Temporary
    moduleExports.initSentry &&= () => undefined;
    if (moduleExports.default?.track && moduleExports.default.trackMaker)
        moduleExports.default.track = () => Promise.resolve();

    if (moduleExports.registerAsset) {
        require("@lib/api/assets").patchAssets(moduleExports);
    }

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

    if (!patchedImportTracker && moduleExports.fileFinishedImporting) {
        before("fileFinishedImporting", moduleExports, ([filePath]) => {
            if (_importingModuleId == null || !filePath) return;
            metroModules[_importingModuleId]!.__filePath = filePath;
        });
        patchedImportTracker = true;
    }

    // Funny infinity recursion caused by a race condition
    if (!patchedInspectSource && window["__core-js_shared__"]) {
        const inspect = (f: unknown) => typeof f === "function" && functionToString.apply(f, []);
        window["__core-js_shared__"].inspectSource = inspect;
        patchedInspectSource = true;
    }

    // Explosion (no, I can't explain this, don't ask) ((hi rosie))
    if (moduleExports.findHostInstance_DEPRECATED) {
        const numberedId = Number(id);
        const prevExports = metroModules[numberedId - 1]?.publicModule.exports;
        const inc = prevExports.default?.reactProfilingEnabled ? 1 : -1;
        if (!metroModules[numberedId + inc]?.isInitialized) {
            blacklistModule(String(numberedId + inc));
        }
    }

    // Hindi timestamps moment
    if (moduleExports.isMoment) {
        instead("defineLocale", moduleExports, (args, orig) => {
            const origLocale = moduleExports.locale();
            orig(...args);
            moduleExports.locale(origLocale);
        });
    }
}

export function getImportingModuleId() {
    return _importingModuleId;
}

export function requireModule(id: Metro.ModuleID) {
    if (!metroModules[0]?.isInitialized) metroRequire(0);
    if (blacklistedIds.has(String(id))) return undefined;

    if (metroModules[id]?.isInitialized && !metroModules[id]?.hasError) {
        return metroRequire(id);
    }

    // Disable Internal Metro error reporting logic
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(noopHandler);

    let moduleExports;
    try {
        moduleExports = metroRequire(id);
    } catch {
        blacklistModule(String(id));
        moduleExports = undefined;
    }

    // Done initializing! Now, revert our hacks
    ErrorUtils.setGlobalHandler(originalHandler);

    return moduleExports;
}

export function* getModules(uniq: string, all = false) {
    yield [-1, require("@metro/polyfills/redesign")];

    let cache = getMetroCache().findIndex[uniq];
    if (all && !cache?._) cache = undefined;

    for (const id in cache ?? metroModules) {
        const exports = requireModule(id);
        if (isBadExports(exports)) continue;
        yield [id, exports];
    }
}

export function* getCachedPolyfillModules(name: string) {
    const cache = getMetroCache().polyfillIndex[name];
    for (const id in cache ?? metroModules) {
        const exports = requireModule(id);
        if (isBadExports(exports)) continue;
        yield [id, exports];
    }
}