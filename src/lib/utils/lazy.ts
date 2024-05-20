const factorySymbol = Symbol.for("bunny.lazyFactory");
const cacheSymbol = Symbol("bunny.lazyCache");
const dummySymbol = Symbol("bunny.lazyDummy");

const unconfigurable = ["arguments", "caller", "prototype"];
const isUnconfigurable = (key: PropertyKey) => typeof key === "string" && unconfigurable.includes(key);

const lazyHandler: ProxyHandler<any> = {
    ...Object.fromEntries(Object.getOwnPropertyNames(Reflect).map(fnName => {
        return [fnName, (target: any, ...args: any[]) => {
            // @ts-ignore
            const func = s => Reflect[fnName](s, ...args);
            return func(target[factorySymbol]()) ?? func(target[dummySymbol]);
        }];
    })),
    ownKeys: target => {
        const cacheKeys = Reflect.ownKeys(target[factorySymbol]() ?? target[dummySymbol]);
        unconfigurable.forEach(key => isUnconfigurable(key) && cacheKeys.push(key));
        return cacheKeys;
    },
    getOwnPropertyDescriptor: (target, p) => {
        if (isUnconfigurable(p)) return Reflect.getOwnPropertyDescriptor(target, p);

        const descriptor = Reflect.getOwnPropertyDescriptor(target[factorySymbol]() ?? target[dummySymbol], p);
        if (descriptor) Object.defineProperty(target, p, descriptor);
        return descriptor;
    },
};

/**
 * Lazy proxy that will only call the factory function when needed (when a property is accessed)
 * @param factory Factory function to create the object
 * @returns A proxy that will call the factory function only when needed
 */
export function proxyLazy<T>(factory: () => T, dummy: any = () => void 0): T {
    dummy[factorySymbol] = () => dummy[cacheSymbol] ??= factory();
    dummy[dummySymbol] = dummy;

    return new Proxy(dummy, lazyHandler) as any;
}
