import { createEmitter, Emitter } from "@lib/utils/emitter";
import { StorageBackend } from "@lib/api/storage/backends";

const emitterSymbol = Symbol.for("vendetta.storage.emitter");
const syncAwaitSymbol = Symbol.for("vendetta.storage.accessor");

export function createProxy(target: any = {}): { proxy: any; emitter: Emitter } {
    const emitter = createEmitter();

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
                        return createProxy(value, newPath);
                    }
                    return value;
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

    return {
        proxy: createProxy(target, []),
        emitter,
    };
}

export function useProxy<T>(storage: T): T {
    const emitter = (storage as any)[emitterSymbol] as Emitter;

    const [, forceUpdate] = React.useReducer((n) => ~n, 0);

    React.useEffect(() => {
        const listener = () => forceUpdate();

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

    store.then((v) => {
        awaited = v;
        awaitQueue.forEach((cb) => cb());
    });

    return new Proxy({} as Awaited<T>, {
        ...Object.fromEntries(
            Object.getOwnPropertyNames(Reflect)
                // @ts-expect-error
                .map((k) => [k, (t: T, ...a: any[]) => Reflect[k](awaited ?? t, ...a)])
        ),
        get(target, prop, recv) {
            if (prop === syncAwaitSymbol) return awaitInit;
            return Reflect.get(awaited ?? target, prop, recv);
        },
    });
}

export const awaitSyncWrapper = (store: any) => new Promise<void>((res) => store[syncAwaitSymbol](res));

export * from "@lib/api/storage/backends";
