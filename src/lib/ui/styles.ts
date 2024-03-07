import { isSemanticColor, resolveSemanticColor } from "@ui/color";
import { CompatfulRedesign } from "@ui/components/discord/Redesign";
import { DiscordTextStyles } from "@ui/types";
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export const { TextStyleSheet } = CompatfulRedesign as unknown as {
    TextStyleSheet: { [key in DiscordTextStyles]: TextStyle; };
};

export function createStyles<T extends NamedStyles<T>>(sheet: T | ((props: any) => T)): () => T {
    return CompatfulRedesign.createStyles(sheet);
}

// Reimplementation of Discord's createThemedStyleSheet, which was removed since 204201
// Not exactly a 1:1 reimplementation, but sufficient to keep compatibility with existing plugins
export function createThemedStyleSheet<T extends StyleSheet.NamedStyles<T>>(sheet: T) {
    for (const key in sheet) {
        // @ts-ignore
        sheet[key] = new Proxy(StyleSheet.flatten(sheet[key]), {
            get(target, prop, receiver) {
                const res = Reflect.get(target, prop, receiver);
                return typeof res === "symbol" && isSemanticColor(res) ? resolveSemanticColor(res) : res;
            }
        });
    }

    return sheet;
}
