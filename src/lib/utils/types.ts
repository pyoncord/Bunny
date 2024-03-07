
export type StringUnion<T> = T | (string & {});
export type OptionalKeys<T extends Array<string>> = StringUnion<T[number]>;

export type ExcludeInternalProperties<T> = {
    [K in keyof T as K extends `_${string}` ? never : K]: T[K] extends object ? ExcludeInternalProperties<T[K]> : T[K];
};

export interface Author {
    name: string;
    id?: string;
}

export enum ButtonColors {
    BRAND = "brand",
    RED = "red",
    GREEN = "green",
    PRIMARY = "primary",
    TRANSPARENT = "transparent",
    GREY = "grey",
    LIGHTGREY = "lightgrey",
    WHITE = "white",
    LINK = "link"
}
