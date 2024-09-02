import { findAssetId } from "@lib/api/assets";
import { lazyDestructure } from "@lib/utils/lazy";
import { Card, FormRadio, FormSwitch, IconButton, LegacyFormRow, Stack, Text } from "@metro/common/components";
import { findByProps } from "@metro/wrappers";
import { semanticColors } from "@ui/color";
import { createStyles, TextStyleSheet } from "@ui/styles";
import { TouchableOpacity, View } from "react-native";

const { hideActionSheet } = lazyDestructure(() => findByProps("openLazy", "hideActionSheet"));
const { showSimpleActionSheet } = lazyDestructure(() => findByProps("showSimpleActionSheet"));

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
    result: Fuzzysort.KeysResult<T>;
}

interface CardProps {
    index?: number;
    headerLabel: string;
    headerSublabel?: string;
    headerIcon?: string;
    toggleType?: "switch" | "radio";
    toggleValue: () => boolean;
    onToggleChange?: (v: boolean) => void;
    descriptionLabel?: string;
    actions?: Action[];
    overflowTitle?: string;
    overflowActions?: OverflowAction[];
}

export default function AddonCard(props: CardProps) {
    const styles = useStyles();

    return (
        <Card>
            <Stack spacing={16}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.headerLeading}>
                        <Text style={styles.headerLabel}>{props.headerLabel}</Text>
                        {props.headerSublabel && (
                            <Text style={styles.headerSubtitle}>{props.headerSublabel}</Text>
                        )}
                    </View>
                    <View style={[styles.headerTrailing, { marginLeft: "auto" }]}>
                        <View style={styles.actions}>
                            {props.overflowActions &&
                                <IconButton
                                    onPress={() => showSimpleActionSheet({
                                        key: "CardOverflow",
                                        header: {
                                            title: props.overflowTitle,
                                            icon: props.headerIcon && <LegacyFormRow.Icon style={{ marginRight: 8 }} source={findAssetId(props.headerIcon)} />,
                                            onClose: () => hideActionSheet(),
                                        },
                                        options: props.overflowActions?.map(i => ({
                                            ...i,
                                            icon: findAssetId(i.icon)
                                        })),
                                    })}
                                    size="sm"
                                    variant="secondary"
                                    icon={findAssetId("CircleInformationIcon-primary")}
                                />}
                            {props.actions?.map(({ icon, onPress, disabled }) => (
                                <IconButton
                                    onPress={onPress}
                                    disabled={disabled}
                                    size="sm"
                                    variant="secondary"
                                    icon={findAssetId(icon)}
                                />
                            ))}
                        </View>
                        {props.toggleType && (props.toggleType === "switch" ?
                            <FormSwitch
                                value={props.toggleValue()}
                                onValueChange={props.onToggleChange}
                            />
                            :
                            <TouchableOpacity onPress={() => {
                                props.onToggleChange?.(!props.toggleValue());
                            }}>
                                <FormRadio selected={props.toggleValue()} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                {props.descriptionLabel && <Text variant="text-md/medium">
                    {props.descriptionLabel}
                </Text>}
            </Stack>
        </Card >
    );
}
