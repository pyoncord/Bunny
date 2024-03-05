import { constants,ReactNative as RN, stylesheet } from "@metro/common";
import { semanticColors } from "@ui/color";

export interface CodeblockProps {
    selectable?: boolean;
    style?: import("react-native").TextStyle;
    children?: string;
}

const styles = stylesheet.createThemedStyleSheet({
    codeBlock: {
        fontFamily: constants.Fonts.CODE_SEMIBOLD,
        fontSize: 12,
        textAlignVertical: "center",
        backgroundColor: semanticColors.BACKGROUND_SECONDARY,
        color: semanticColors.TEXT_NORMAL,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: semanticColors.BACKGROUND_TERTIARY,
        padding: 10,
    },
});

// iOS doesn't support the selectable property on RN.Text...
const InputBasedCodeblock = ({ style, children }: CodeblockProps) => <RN.TextInput editable={false} multiline style={[styles.codeBlock, style && style]} value={children} />;
const TextBasedCodeblock = ({ selectable, style, children }: CodeblockProps) => <RN.Text selectable={selectable} style={[styles.codeBlock, style && style]}>{children}</RN.Text>;

export default function Codeblock({ selectable, style, children }: CodeblockProps) {
    if (!selectable) return <TextBasedCodeblock style={style} children={children} />;

    return RN.Platform.select({
        ios: <InputBasedCodeblock style={style} children={children} />,
        default: <TextBasedCodeblock style={style} children={children} selectable />,
    });
}
