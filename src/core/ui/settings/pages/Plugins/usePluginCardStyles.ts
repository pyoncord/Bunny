import { createStyles, TextStyleSheet } from "@lib/ui/styles";
import { tokens } from "@metro/common";

export const usePluginCardStyles = createStyles({
    header: {
        paddingVertical: 2,
    },
    headerLeading: {
        flexDirection: "column",
        justifyContent: "center",
        scale: 1.2
    },
    headerTrailing: {
        display: "flex",
        flexDirection: "row",
        gap: 15,
        alignItems: "center"
    },
    headerLabel: {
        ...TextStyleSheet["heading-md/semibold"],
        color: tokens.colors.TEXT_NORMAL,
    },
    headerSubtitle: {
    },
    descriptionLabel: {
        ...TextStyleSheet["text-md/semibold"],
        color: tokens.colors.TEXT_NORMAL,
    },
    actions: {
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 5
    },
    iconStyle: {
        tintColor: tokens.colors.LOGO_PRIMARY
    }
});
