import { StorageBackend } from "@lib/api/storage/backends";
import { Emitter, EmitterEvent, EmitterListener, EmitterListenerData } from "@lib/utils/Emitter";

const emitterSymbol = Symbol.for("vendetta.storage.emitter");
const syncAwaitSymbol = Symbol.for("vendetta.storage.accessor");

export function createProxy(target: any = {}): { proxy: any; emitter: Emitter; } {
    const emitter = new Emitter();
    const parentTarget = target;

    const childrens = new WeakMap<any, any>();
    const proxiedChildrenSet = new WeakSet<any>();

    function createProxy(target: any, path: string[]): any {
        return new Proxy(target, {
            get(target, prop: string) {
                if ((prop as unknown) === emitterSymbol) return emitter;

                const newPath = [...path, prop];
                const value: any = target[prop];

                if (value !== undefined && value !== null) {
                    emitter.emit("GET", {
                        path: newPath,
                        value,
                    });

                    if (typeof value === "object") {
                        if (proxiedChildrenSet.has(value)) return value;
                        if (childrens.has(value)) return childrens.get(value);

                        const childrenProxy = createProxy(value, newPath);
                        childrens.set(value, childrenProxy);
                        return childrenProxy;
                    }

                    return value;
                }

                return value;
            },

            set(target, prop: string, value) {
                if (typeof value === "object") {
                    if (childrens.has(value)) {
                        target[prop] = childrens.get(value);
                    } else {
                        const childrenProxy = createProxy(value, [...path, prop]);
                        childrens.set(value, childrenProxy);
                        proxiedChildrenSet.add(value);
                        target[prop] = childrenProxy;
                    }
                } else {
                    target[prop] = value;
                }

                emitter.emit("SET", {
                    path: [...path, prop],
                    value: target[prop],
                });
                // we do not care about success, if this actually does fail we have other problems
                return true;
            },

            deleteProperty(target, prop: string) {
                const value = typeof target[prop] === "object" ? childrens.get(target[prop])! : target[prop];
                const success = delete target[prop];
                if (success)
                    emitter.emit("DEL", {
                        value,
                        path: [...path, prop],
                    });
                return success;
            },
        });
    }

    return {
        proxy: createProxy(target, []),
        emitter,
    };
}

export function useProxy<T>(storage: T): T {
    const emitter = (storage as any)?.[emitterSymbol] as Emitter;
    if (!emitter) throw new Error("storage?.[emitterSymbol] is undefined");

    const [, forceUpdate] = React.useReducer(n => ~n, 0);

    React.useEffect(() => {
        const listener: EmitterListener = (event: EmitterEvent, data: EmitterListenerData) => {
            if (event === "DEL" && data.value === storage) return;
            forceUpdate();
        };

        emitter.on("SET", listener);
        emitter.on("DEL", listener);

        return () => {
            emitter.off("SET", listener);
            emitter.off("DEL", listener);
        };
    }, []);

    return storage;
}

export async function createStorage<T>(backend: StorageBackend): Promise<Awaited<T>> {
    const data = await backend.get();
    const { proxy, emitter } = createProxy(data);

    const handler = () => backend.set(proxy);
    emitter.on("SET", handler);
    emitter.on("DEL", handler);

    return proxy;
}

export function wrapSync<T extends Promise<any>>(store: T): Awaited<T> {
    let awaited: any = undefined;

    const awaitQueue: (() => void)[] = [];
    const awaitInit = (cb: () => void) => (awaited ? cb() : awaitQueue.push(cb));

    store.then(v => {
        awaited = v;
        awaitQueue.forEach(cb => cb());
    });

    return new Proxy({} as Awaited<T>, {
        ...Object.fromEntries(
            Object.getOwnPropertyNames(Reflect)
                // @ts-expect-error
                .map(k => [k, (t: T, ...a: any[]) => Reflect[k](awaited ?? t, ...a)])
        ),
        get(target, prop, recv) {
            if (prop === syncAwaitSymbol) return awaitInit;
            return Reflect.get(awaited ?? target, prop, recv);
        },
    });
}

export function awaitStorage(...stores: any[]) {
    return Promise.all(
        stores.map(store => new Promise<void>(res => store[syncAwaitSymbol](res)))
    );
}

export {
    createFileBackend,
    createMMKVBackend,
    purgeStorage
} from "@lib/api/storage/backends";
