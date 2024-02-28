export function without<O extends object, K extends readonly (keyof O)[]>(object: O, ...keys: K): Omit<O, typeof keys[number]> {
    const cloned = { ...object };
    keys.forEach((k) => delete cloned[k]);
    return cloned;
}