import { createStyles } from "@lib/ui/styles";
import { tokens } from "@metro/common";

export const usePluginCardStyles = createStyles({
    pluginIcon: {
        tintColor: tokens.colors.LOGO_PRIMARY,
        height: 18,
        width: 18,
    },
    actionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 20,
        backgroundColor: tokens.colors.BACKGROUND_ACCENT,
        justifyContent: "center",
        alignItems: "center",
    },
    actionIcon: {
        tintColor: tokens.colors.INTERACTIVE_NORMAL,
        width: 18,
        height: 18,
    },
});
