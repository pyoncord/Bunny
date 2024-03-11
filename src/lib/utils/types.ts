import { LiteralUnion } from "type-fest";

export type OptionalKeys<T extends Array<string>> = LiteralUnion<T[number], string>;

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
