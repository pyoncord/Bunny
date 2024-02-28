import langDefault from "./default.json";

type I18nKey = keyof typeof langDefault;

export const Strings = new Proxy({}, {
    get: (_t, prop: keyof typeof langDefault) => {
        return langDefault[prop];
    }
}) as Record<I18nKey, string>;

export function formatString(key: I18nKey, val: Record<string, any>) {
    const str = Strings[key];

    return str.replaceAll(/{(.*)}/g, (_, cap) => {
        return val[cap] ?? cap;
    });
}

export function formatStringSplit(key: I18nKey, val: Record<string, any>) {
    const str = Strings[key];

    const splitted = str.split(/({[^}]+})/);

    for (const inp in val) {
        for (let i = 0; i < splitted.length; i++) {
            if (splitted[i] === `{${inp}}`) {
                splitted[i] = val[inp];
            }
        }
    }

    return splitted;
}