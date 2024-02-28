import { ReactNative as RN, stylesheet, clipboard } from "@metro/common";
import { HTTP_REGEX_MULTI } from "@lib/utils/constants";
import { showInputAlert } from "@ui/alerts";
import { getAssetIDByName } from "@/lib/api/assets";
import { semanticColors } from "@ui/color";
import { Strings } from "@/core/i18n";

const styles = stylesheet.createThemedStyleSheet({
    icon: {
        marginRight: 10,
        tintColor: semanticColors.HEADER_PRIMARY,
    },
});

interface InstallButtonProps {
    alertTitle: string;
    installFunction: (id: string) => Promise<void>;
}

export default function InstallButton({ alertTitle, installFunction: fetchFunction }: InstallButtonProps) {
    return (
        <RN.TouchableOpacity onPress={() =>
            clipboard.getString().then((content) =>
                showInputAlert({
                    title: alertTitle,
                    initialValue: content.match(HTTP_REGEX_MULTI)?.[0] ?? "",
                    placeholder: "https://example.com/",
                    onConfirm: (input: string) => fetchFunction(input),
                    confirmText: Strings.INSTALL,
                    cancelText: Strings.CANCEL,
                })
            )
        }>
            <RN.Image style={styles.icon} source={getAssetIDByName("ic_add_24px")} />
        </RN.TouchableOpacity>
    );
}
