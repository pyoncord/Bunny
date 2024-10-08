import { lazyDestructure, proxyLazy } from "@lib/utils/lazy";
import { findByProps, findByPropsLazy } from "@metro/wrappers";
import { isSemanticColor, resolveSemanticColor } from "@ui/color";
import { DiscordTextStyles } from "@ui/types";
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

const CompatfulRedesign = findByPropsLazy("createStyles");

export const { TextStyleSheet } = lazyDestructure(() => findByProps("TextStyleSheet")) as unknown as {
    TextStyleSheet: { [key in DiscordTextStyles]: TextStyle; };
};

export function createStyles<T extends NamedStyles<T>>(sheet: T | ((props: any) => T)): () => T {
    return proxyLazy(() => CompatfulRedesign.createStyles(sheet));
}

// Reimplementation of Discord's createThemedStyleSheet, which was removed since 204201
// Not exactly a 1:1 reimplementation, but sufficient to keep compatibility with existing plugins
export function createThemedStyleSheet<T extends StyleSheet.NamedStyles<T>>(sheet: T) {
    for (const key in sheet) {
        // @ts-ignore
        sheet[key] = new Proxy(StyleSheet.flatten(sheet[key]), {
            get(target, prop, receiver) {
                const res = Reflect.get(target, prop, receiver);
                return isSemanticColor(res) ? resolveSemanticColor(res) : res;
            }
        });
    }

    return sheet;
}
