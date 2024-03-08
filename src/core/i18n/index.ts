import { FluxDispatcher } from "@lib/metro/common";
import { findByName } from "@lib/metro/filters";
import { PrimitiveType } from "intl-messageformat";

import langDefault from "./default.json";

const IntlMessageFormat = findByName("MessageFormat") as typeof import("intl-messageformat").default;

type I18nKey = keyof typeof langDefault;

let currentLocale: string | null;
const _loadedLocale = new Set<string>();
const _loadedStrings = {} as Record<string, typeof langDefault>;

export const Strings = new Proxy({}, {
    get: (_t, prop: keyof typeof langDefault) => {
        if (currentLocale && _loadedStrings[currentLocale]?.[prop]) {
            return _loadedStrings[currentLocale]?.[prop];
        }
        return langDefault[prop];
    }
}) as Record<I18nKey, string>;

export function initFetchI18nStrings() {
    const cb = ({ locale }: { locale: string; }) => {
        const languageMap = {
            "es-ES": "es",
            "es-419": "es_419",
            "zh-TW": "zh-Hant",
            "zh-CN": "zh-Hans",
            "pt-PT": "pt",
            "sv-SE": "sv"
        } as Record<string, string>;

        const resolvedLocale = languageMap[locale] ?? locale;
        if (resolvedLocale.startsWith("en-")) {
            currentLocale = null;
            return;
        }

        if (!_loadedLocale.has(resolvedLocale)) {
            _loadedLocale.add(resolvedLocale);

            fetch(`https://raw.githubusercontent.com/pyoncord/i18n/main/resources/${resolvedLocale}/bunny.json`)
                .then(r => r.json())
                .then(strings => _loadedStrings[resolvedLocale] = strings)
                .then(() => currentLocale = resolvedLocale)
                .catch(e => console.error(`An error occured while fetching strings for ${resolvedLocale}: ${e}`));
        } else {
            currentLocale = resolvedLocale;
        }
    };

    FluxDispatcher.subscribe("I18N_LOAD_SUCCESS", cb);
    return () => FluxDispatcher.unsubscribe("I18N_LOAD_SUCCESS", cb);
}

type FormatStringRet<T> = T extends PrimitiveType ? string : string | T | (string | T)[];

export function formatString<T = void>(key: I18nKey, val: Record<string, T>): FormatStringRet<T> {
    const str = Strings[key];
    // @ts-ignore
    return new IntlMessageFormat(str).format(val);
}
