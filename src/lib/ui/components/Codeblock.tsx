import { constants } from "@metro/common";
import { semanticColors } from "@ui/color";
import { createStyles } from "@ui/styles";
import { Platform, Text, TextInput } from "react-native";

export interface CodeblockProps {
    selectable?: boolean;
    style?: import("react-native").TextStyle;
    children?: string;
}

const useStyles = createStyles({
    codeBlock: {
        fontFamily: constants.Fonts.CODE_NORMAL,
        fontSize: 12,
        textAlignVertical: "center",
        backgroundColor: semanticColors.BACKGROUND_SECONDARY,
        color: semanticColors.TEXT_NORMAL,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: semanticColors.BACKGROUND_TERTIARY,
        padding: 10,
    },
});

// iOS doesn't support the selectable property on RN.Text...
const InputBasedCodeblock = ({ style, children }: CodeblockProps) => <TextInput editable={false} multiline style={[useStyles().codeBlock, style && style]} value={children} />;
const TextBasedCodeblock = ({ selectable, style, children }: CodeblockProps) => <Text selectable={selectable} style={[useStyles().codeBlock, style && style]}>{children}</Text>;

export default function Codeblock({ selectable, style, children }: CodeblockProps) {
    if (!selectable) return <TextBasedCodeblock style={style} children={children} />;

    return Platform.select({
        ios: <InputBasedCodeblock style={style} children={children} />,
        default: <TextBasedCodeblock style={style} children={children} selectable />,
    });
}
