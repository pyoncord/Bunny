import { Strings } from "@core/i18n";
import { getAssetIDByName } from "@lib/api/assets";
import { HTTP_REGEX_MULTI } from "@lib/utils/constants";
import { clipboard } from "@metro/common";
import { showInputAlert } from "@ui/alerts";
import { semanticColors } from "@ui/color";
import { createStyles } from "@ui/styles";
import { Image, TouchableOpacity } from "react-native";

const useStyles = createStyles({
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
    const styles = useStyles();

    return (
        <TouchableOpacity onPress={() =>
            clipboard.getString().then(content =>
                showInputAlert({
                    title: alertTitle,
                    initialValue: content.match(HTTP_REGEX_MULTI)?.[0] ?? "",
                    placeholder: Strings.URL_PLACEHOLDER,
                    onConfirm: (input: string) => fetchFunction(input),
                    confirmText: Strings.INSTALL,
                    cancelText: Strings.CANCEL,
                })
            )
        }>
            <Image style={styles.icon} source={getAssetIDByName("ic_add_24px")} />
        </TouchableOpacity>
    );
}
