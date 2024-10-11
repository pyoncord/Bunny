// New iteration of storage API, mostly yoinked from unreleased pyoncord (and sunrise?)
import { fileExists, readFile, writeFile } from "@lib/api/native/fs";
import { Emitter } from "@lib/utils/Emitter";

interface StorageBackend<T = unknown> {
    get: () => Promise<T>;
    set: (data: T) => Promise<void>;
    exists: () => Promise<boolean>;
}

const emitterSymbol = Symbol.for("bunny.storage.emitter");
const storageInitErrorSymbol = Symbol.for("bunny.storage.initError");
const storagePromiseSymbol = Symbol.for("bunny.storage.promise");

const _loadedPath = {} as Record<string, any>;

function createFileBackend<T = any>(filePath: string): StorageBackend<T> {
    return {
        get: async () => {
            try {
                return JSON.parse(await readFile(filePath));
            } catch (e) {
                throw new Error(`Failed to parse storage from '${filePath}'`, { cause: e });
            }
        },
        set: async data => {
            if (!data || typeof data !== "object") throw new Error("data needs to be an object");
            await writeFile(filePath, JSON.stringify(data));
        },
        exists: async () => {
            return await fileExists(filePath);
        }
    };
}

function _createProxy(target: any, path: string[], emitter: Emitter): any {
    // cache the children proxies so proxy.child === proxy.child (yields the same value)
    const objChildrens = new WeakMap<object, object>();

    return new Proxy(target, {
        get(target, prop: string) {
            if ((prop as unknown) === emitterSymbol) return emitter;

            const newPath = [...path, prop];
            let value: any = target[prop];

            if (value && typeof value === "object") {
                const origValue = value;
                value = objChildrens.get(origValue);
                if (!value) {
                    value = _createProxy(origValue, newPath, emitter);
                    objChildrens.set(origValue, value!);
                }
            }

            if (value != null) {
                emitter.emit("GET", {
                    path: newPath,
                    value,
                });
            }

            return value;
        },

        set(target, prop: string, value) {
            target[prop] = value;
            emitter.emit("SET", {
                path: [...path, prop],
                value,
            });

            // we do not care about success, if this actually does fail we have other problems
            return true;
        },

        deleteProperty(target, prop: string) {
            const success = delete target[prop];
            if (success)
                emitter.emit("DEL", {
                    path: [...path, prop],
                });
            return success;
        },
    });
}

export function createProxy(target: any = {}): { proxy: any; emitter: Emitter; } {
    const emitter = new Emitter();

    return {
        proxy: _createProxy(target, [], emitter),
        emitter,
    };
}

export function useProxy<T>(storage: T & { [key: string | symbol]: any; }) {
    if (storage[storageInitErrorSymbol]) throw new Error(
        "An error occured while initializing the storage",
        { cause: storage[storageInitErrorSymbol] }
    );

    const emitter = storage[emitterSymbol] as Emitter;

    if (emitter == null) {
        throw new Error(`InvalidArgumentException - storage[emitterSymbol] is ${typeof emitter}`);
    }

    const [, forceUpdate] = React.useReducer(n => ~n, 0);

    React.useEffect(() => {
        const listener = () => forceUpdate();

        emitter.on("SET", listener);
        emitter.on("DEL", listener);

        return () => {
            emitter.off("SET", listener);
            emitter.off("DEL", listener);
        };
    }, []);
}

export async function updateStorageAsync<T>(path: string, value: T): Promise<void> {
    _loadedPath[path] = value;
    await createFileBackend<T>(path).set(value);
}

export function createStorageAndCallback<T>(path: string, dflt = {} as T, cb: (proxy: T) => void) {
    const callback = (data: any) => {
        const { proxy, emitter } = createProxy(data);

        const handler = () => backend.set(proxy);
        emitter.on("SET", handler);
        emitter.on("DEL", handler);

        cb(proxy);
    };

    const backend = createFileBackend<T>(path);
    if (_loadedPath[path]) callback(_loadedPath[path]);
    else {
        backend.exists().then(async exists => {
            if (!exists) {
                await backend.set(dflt);
                callback(dflt);
            } else {
                callback(await backend.get());
            }
        });
    }
}

export async function createStorageAsync<T>(path: string, dflt = {} as T): Promise<T> {
    return new Promise(r => createStorageAndCallback(path, dflt, r));
}

export const createStorage = <T>(path: string, dflt = {} as T): T & { [key: symbol]: any; } => {
    const promise = new Promise(r => resolvePromise = r);
    let awaited: any, resolved: boolean, error: any, resolvePromise: (val?: unknown) => void;

    createStorageAndCallback(path, dflt, proxy => {
        awaited = proxy;
        resolved = true;
        resolvePromise();
    });

    const check = () => {
        if (resolved) return true;
        throw new Error("Attempted to access storage without initializing");
    };

    return new Proxy({} as any, {
        ...Object.fromEntries(
            Object.getOwnPropertyNames(Reflect)
                .map(k => [k, (t: T, ...a: any[]) => {
                    // @ts-expect-error
                    return check() && Reflect[k](awaited, ...a);
                }])
        ),
        get(target, prop, recv) {
            if (prop === storageInitErrorSymbol) return error;
            if (prop === storagePromiseSymbol) return promise;
            return check() && Reflect.get(awaited ?? target, prop, recv);
        },
    });
};

export async function preloadStorageIfExists(path: string) {
    if (_loadedPath[path]) return _loadedPath[path];

    const backend = createFileBackend(path);
    if (await backend.exists()) {
        return _loadedPath[path] = await backend.get();
    }
}

export function getPreloadedStorage<T>(path: string): T {
    return _loadedPath[path];
}
export function awaitStorage(...proxies: any[]) {
    return Promise.all(proxies.map(proxy => proxy[storagePromiseSymbol]));
}
