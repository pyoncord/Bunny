import { LiteralUnion } from "type-fest";

type KeyOfOrAny<P, T extends object> = P extends keyof T ? T[P] : any;

export default function hookDefineProperty<
    T extends object,
    P extends LiteralUnion<keyof T, PropertyKey>
>(target: T, property: LiteralUnion<keyof T, PropertyKey>, cb: (val: KeyOfOrAny<P, T>) => KeyOfOrAny<P, T>) {
    const targetAsAny = target as any;

    if (property in target) {
        return void cb(targetAsAny[property]);
    }

    let value: any;

    Object.defineProperty(targetAsAny, property, {
        get: () => value,
        set(v) {
            value = cb(v) ?? v;
        },
        configurable: true,
        enumerable: false
    });

    return () => {
        delete targetAsAny[property];
        targetAsAny[property] = value;
    };
}
