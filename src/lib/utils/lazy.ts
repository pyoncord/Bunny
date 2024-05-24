/* eslint-disable func-call-spacing */
const unconfigurable = ["arguments", "caller", "prototype"];
const isUnconfigurable = (key: PropertyKey) => typeof key === "string" && unconfigurable.includes(key);

const proxyToFactoryMap = new WeakMap<any, () => any>();
const dummyToFactoryMap = new WeakMap<any, () => any>();

const lazyHandler: ProxyHandler<any> = {
    ...Object.fromEntries(Object.getOwnPropertyNames(Reflect).map(fnName => {
        return [fnName, (target: any, ...args: any[]) => {
            const resolved = dummyToFactoryMap.get(target)!();
            if (!resolved) throw new Error(`Trying to ${fnName} of ${typeof resolved}`);
            // @ts-expect-error
            return Reflect[fnName](resolved, ...args);
        }];
    })),
    ownKeys: target => {
        const resolved = dummyToFactoryMap.get(target)!();
        if (!resolved) throw new Error(`Trying to ownKeys of ${typeof resolved}`);

        const cacheKeys = Reflect.ownKeys(dummyToFactoryMap.get(target)!());
        unconfigurable.forEach(key => !cacheKeys.includes(key) && cacheKeys.push(key));
        return cacheKeys;
    },
    getOwnPropertyDescriptor: (target, p) => {
        const resolved = dummyToFactoryMap.get(target)!();
        if (!resolved) throw new Error(`Trying to getOwnPropertyDescriptor of ${typeof resolved}`);

        if (isUnconfigurable(p)) return Reflect.getOwnPropertyDescriptor(target, p);

        const descriptor = Reflect.getOwnPropertyDescriptor(dummyToFactoryMap.get(target)!(), p);
        if (descriptor) Object.defineProperty(target, p, descriptor);
        return descriptor;
    },
};

/**
 * Lazy proxy that will only call the factory function when needed (when a property is accessed)
 * @param factory Factory function to create the object
 * @param asFunction Mock the proxy as a function
 * @returns A proxy that will call the factory function only when needed
 * @example const ChannelStore = proxyLazy(() => findByProps("getChannelId"));
 */
export function proxyLazy<T>(factory: () => T, asFunction = true): T {
    let cache: T;

    const dummy = asFunction ? function () { } as any : {};
    const proxyFactory = () => cache ??= factory();

    const proxy = new Proxy(dummy, lazyHandler) as T;
    proxyToFactoryMap.set(proxy, proxyFactory);
    dummyToFactoryMap.set(dummy, proxyFactory);

    return proxy;
}

/**
 * Lazily destructure an object with all the properties being lazified. This assumes all the properties are either an object or a function
 * @param factory Factory function which resolves to the object (and caches it)
 * @param asFunction Mock the proxy as a function
 * @example
 *
 * const { uuid4 } = lazyDestructure(() => findByProps("uuid4"))
 * uuid4; // <- is a lazy proxy!
 */
export function lazyDestructure<T extends Record<PropertyKey, unknown>>(factory: () => T, asFunction = false): T {
    const proxiedObject = proxyLazy(factory, asFunction);

    return new Proxy({}, {
        get(_, property) {
            if (property === Symbol.iterator) {
                return function* () {
                    yield proxiedObject;
                    yield new Proxy({}, {
                        get: (_, p) => proxyLazy(() => proxiedObject[p])
                    });
                    throw new Error("This is not a real iterator, this is likely used incorrectly");
                };
            }
            return proxyLazy(() => proxiedObject[property]);
        }
    }) as T;
}

export function getFactoryOfProxy<T>(obj: T): (() => T) | void {
    return proxyToFactoryMap.get(obj) as (() => T) | void;
}
