
export type StringUnion<T> = T | (string & Record<any, unknown>);
export type OptionalKeys<T extends Array<string>> = StringUnion<T[number]>;

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
