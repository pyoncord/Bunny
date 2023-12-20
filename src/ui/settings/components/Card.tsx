import { ReactNative as RN, stylesheet } from "@metro/common";
import { findByProps } from "@metro/filters";
import { getAssetIDByName } from "@ui/assets";
import { semanticColors } from "@ui/color";
import { Forms } from "@ui/components";

const { TableRow, TableRowIcon, TableSwitchRow, TableCheckboxRow, TableRowGroup } = findByProps("TableRow");
const { FormSwitch, FormRadio } = Forms;
const { hideActionSheet } = findByProps("openLazy", "hideActionSheet");
const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");

// TODO: These styles work weirdly. iOS has cramped text, Android with low DPI probably does too. Fix?
const styles = stylesheet.createThemedStyleSheet({
    card: {
        backgroundColor: semanticColors?.BACKGROUND_SECONDARY,
        borderRadius: 15,
        overflow: "hidden"
    },
    header: {
        padding: 0,
        backgroundColor: semanticColors?.BACKGROUND_TERTIARY,
    },
    actions: {
        flexDirection: "row-reverse",
        alignItems: "center",
    },
    actionIcon: {
        width: 22,
        height: 22,
        marginLeft: 5,
        tintColor: semanticColors?.INTERACTIVE_NORMAL,
    },
})

interface Action {
    icon: string;
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
    headerLabel: string | React.ComponentType;
    headerIcon?: string;
    toggleType?: "switch" | "radio";
    toggleValue?: boolean;
    onToggleChange?: (v: boolean) => void;
    descriptionLabel?: string | React.ComponentType;
    actions?: Action[];
    overflowTitle?: string;
    overflowActions?: OverflowAction[];
}

export default function Card(props: CardProps) {
    let pressableState = props.toggleValue ?? false;

    const headerProps = {
        style: styles.header,
        label: props.headerLabel,
        icon: props.headerIcon && <TableRowIcon source={getAssetIDByName(props.headerIcon)} />
    };

    return (
        <RN.View style={[styles.card, { marginTop: props.index !== 0 ? 10 : 0 }]}>
            <TableRowGroup>
            {props.toggleType && (props.toggleType === "switch" ?
                <TableSwitchRow
                    {...headerProps}
                    value={props.toggleValue}
                    onValueChange={props.onToggleChange}
                /> : <TableCheckboxRow
                    {...headerProps}
                    onPress={() => {
                        pressableState = !pressableState;
                        props.onToggleChange?.(pressableState)
                    }}
                    checked={props.toggleValue}
                />)}
            <TableRow
                label={props.descriptionLabel}
                trailing={
                    <RN.View style={styles.actions}>
                        {props.overflowActions && <RN.TouchableOpacity
                            onPress={() => showSimpleActionSheet({
                                key: "CardOverflow",
                                header: {
                                    title: props.overflowTitle,
                                    icon: props.headerIcon && <TableRowIcon style={{ marginRight: 8 }} source={getAssetIDByName(props.headerIcon)} />,
                                    onClose: () => hideActionSheet(),
                                },
                                options: props.overflowActions?.map(i => ({ ...i, icon: getAssetIDByName(i.icon) })),
                            })}
                        >
                            <RN.Image style={styles.actionIcon} source={getAssetIDByName("ic_more_24px")} />
                        </RN.TouchableOpacity>}
                        {props.actions?.map(({ icon, onPress }) => (
                            <RN.TouchableOpacity
                                onPress={onPress}
                            >
                                <RN.Image style={styles.actionIcon} source={getAssetIDByName(icon)} />
                            </RN.TouchableOpacity>
                        ))}
                    </RN.View>
                }
            />
            </TableRowGroup>
        </RN.View>
    )
}
