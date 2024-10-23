import { lazyDestructure, proxyLazy } from "@lib/utils/lazy";
import { findByProps, findByPropsLazy } from "@metro/wrappers";
import { isSemanticColor, resolveSemanticColor } from "@ui/color";
import { TextStyles } from "@ui/types";
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

const Styles = findByPropsLazy("createStyles");

export const { ThemeContext } = lazyDestructure(() => findByProps("ThemeContext"), { hint: "object" });
export const { TextStyleSheet } = lazyDestructure(() => findByProps("TextStyleSheet")) as unknown as {
    TextStyleSheet: Record<TextStyles, TextStyle>;
};

/**
 * Get themed styles based on the current theme
 * @returns A hook that returns the themed stylesheet
 * @example
 * const useStyles = createStyles({
 *      container: {
 *          flex: 1,
 *          backgroundColor: tokens.colors.BACKGROUND_PRIMARY,
 *      },
 * });
 *
 * function MyComponent() {
 *      const styles = useStyles();
 *      return <View style={styles.container} />;
 * }
 */
export function createStyles<T extends NamedStyles<T>>(sheet: T | ((props: any) => T)): () => T {
    return proxyLazy(() => Styles.createStyles(sheet));
}

/**
 * Get themed styles based on the current theme for class components
 * @example
 * const getStyles = createStyles({
 *      container: {
 *          flex: 1,
 *          backgroundColor: tokens.colors.BACKGROUND_PRIMARY,
 *      },
 * });
 *
 * class MyComponent extends React.Component {
 *      static contextType = ThemeContext;
 *      render() {
 *          const styles = getStyles(this.context);
 *          return <View style={styles.container} />;
 *      }
 * }
 */
export function createLegacyClassComponentStyles<T extends NamedStyles<T>>(sheet: T | ((props: any) => T)): (ctxt: typeof ThemeContext) => T {
    return proxyLazy(() => Styles.createLegacyClassComponentStyles(sheet));
}

/**
 * Reimplementation of Discord's createThemedStyleSheet, which was removed since 204201
 * Not exactly a 1:1 reimplementation, but sufficient to keep compatibility with existing plugins
 * @deprecated Use createStyles or createLegacyClassComponentStyles instead
*/
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
