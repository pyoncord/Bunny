import { findByName } from "@/lib/metro/filters";
import langDefault from "./default.json";

const IntlMessageFormat = findByName("MessageFormat") as typeof import("intl-messageformat").default;

type I18nKey = keyof typeof langDefault;

export const Strings = new Proxy({}, {
    get: (_t, prop: keyof typeof langDefault) => {
        return langDefault[prop];
    }
}) as Record<I18nKey, string>;

export function formatString<T = void>(key: I18nKey, val: Record<string, T>) {
    const str = Strings[key];
    return new IntlMessageFormat(str).format(val);
}