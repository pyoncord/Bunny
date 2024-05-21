import { getAssetIDByName } from "@lib/api/assets";
import { ReactNative as RN } from "@metro/common";
import { findByPropsProxy } from "@metro/utils";
import { semanticColors } from "@ui/color";
import { FormRow } from "@ui/components/discord/Forms";
import { FormCheckbox, FormSwitch, IconButton } from "@ui/components/discord/Redesign";
import { createStyles, TextStyleSheet } from "@ui/styles";
import { ImageBackground, View } from "react-native";

const { hideActionSheet } = findByPropsProxy("openLazy", "hideActionSheet");
const { showSimpleActionSheet } = findByPropsProxy("showSimpleActionSheet");

// TODO: These styles work weirdly. iOS has cramped text, Android with low DPI probably does too. Fix?
const useStyles = createStyles({
    card: {
        backgroundColor: semanticColors?.CARD_SECONDARY_BG,
        borderRadius: 12,
        overflow: "hidden"
    },
    header: {
        padding: 0,
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
        color: semanticColors.TEXT_NORMAL,
    },
    headerSubtitle: {
        ...TextStyleSheet["text-md/semibold"],
        color: semanticColors.TEXT_MUTED,
    },
    descriptionLabel: {
        ...TextStyleSheet["text-md/semibold"],
        color: semanticColors.TEXT_NORMAL,
    },
    actions: {
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 5
    },
    iconStyle: {
        tintColor: semanticColors.LOGO_PRIMARY,
        opacity: 0.2,
        height: 64,
        width: 64,
        left: void 0,
        right: "30%",
        top: "-10%"
    }
});

interface Action {
    icon: string;
    disabled?: boolean;
    onPress: () => void;
}

interface OverflowAction extends Action {
    label: string;
    isDestructive?: boolean;
}

export interface CardWrapper<T> {
    item: T;
    index: number;
}

interface CardProps {
    index?: number;
    headerLabel: string;
    headerSublabel?: string;
    headerIcon?: string;
    toggleType?: "switch" | "radio";
    toggleValue?: boolean;
    onToggleChange?: (v: boolean) => void;
    descriptionLabel?: string;
    actions?: Action[];
    overflowTitle?: string;
    overflowActions?: OverflowAction[];
}

export default function Card(props: CardProps) {
    const styles = useStyles();

    return (
        <RN.View style={[styles.card, { marginTop: props.index !== 0 ? 15 : 0 }]}>
            <ImageBackground
                source={props.headerIcon && getAssetIDByName(props.headerIcon) || {}}
                resizeMode="cover"
                imageStyle={styles.iconStyle}
            >
                <FormRow
                    style={styles.header}
                    label={
                        <View style={styles.headerLeading}>
                            <RN.Text style={styles.headerLabel}>{props.headerLabel}</RN.Text>
                            {props.headerSublabel && (
                                <RN.Text style={styles.headerSubtitle}>{props.headerSublabel}</RN.Text>
                            )}
                        </View>
                    }
                    trailing={
                        <View style={styles.headerTrailing}>
                            <View style={styles.actions}>
                                {props.overflowActions &&
                                    <IconButton
                                        onPress={() => showSimpleActionSheet({
                                            key: "CardOverflow",
                                            header: {
                                                title: props.overflowTitle,
                                                icon: props.headerIcon && <FormRow.Icon style={{ marginRight: 8 }} source={getAssetIDByName(props.headerIcon)} />,
                                                onClose: () => hideActionSheet(),
                                            },
                                            options: props.overflowActions?.map(i => ({ ...i, icon: getAssetIDByName(i.icon) })),
                                        })}
                                        size="sm"
                                        variant="secondary"
                                        icon={getAssetIDByName("CircleInformationIcon-primary")}
                                    />}
                                {props.actions?.map(({ icon, onPress, disabled }) => (
                                    <IconButton
                                        onPress={onPress}
                                        disabled={disabled}
                                        size="sm"
                                        variant="secondary"
                                        icon={getAssetIDByName(icon)}
                                    />
                                ))}
                            </View>
                            {props.toggleType && (props.toggleType === "switch" ?
                                <FormSwitch
                                    value={props.toggleValue}
                                    onValueChange={props.onToggleChange}
                                />
                                :
                                <RN.Pressable onPress={() => {
                                    props.onToggleChange?.(!props.toggleValue);
                                }}>
                                    <FormCheckbox checked={props.toggleValue} />
                                </RN.Pressable>
                            )}
                        </View>
                    }
                />
                <FormRow
                    label={
                        <RN.View>
                            <RN.Text style={styles.descriptionLabel}>{props.descriptionLabel}</RN.Text>
                        </RN.View>
                    }
                />
            </ImageBackground>
        </RN.View>
    );
}
