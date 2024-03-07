import { findByName } from "@lib/metro/filters";
import { PrimitiveType } from "intl-messageformat";

import langDefault from "./default.json";

const IntlMessageFormat = findByName("MessageFormat") as typeof import("intl-messageformat").default;

type I18nKey = keyof typeof langDefault;

export const Strings = new Proxy({}, {
    get: (_t, prop: keyof typeof langDefault) => {
        return langDefault[prop];
    }
}) as Record<I18nKey, string>;

type FormatStringRet<T> = T extends PrimitiveType ? string : string | T | (string | T)[];

export function formatString<T = void>(key: I18nKey, val: Record<string, T>): FormatStringRet<T> {
    const str = Strings[key];
    // @ts-ignore
    return new IntlMessageFormat(str).format(val);
}
