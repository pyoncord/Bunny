import ContextMenu from "@/ui/components/ContextMenu";
import { ReactNative as RN, stylesheet } from "@metro/common";
import { findByProps } from "@metro/filters";
import { getAssetIDByName } from "@ui/assets";
import { semanticColors } from "@ui/color";

const { TableRow, TableRowIcon, TableSwitchRow, TableCheckboxRow, TableRowGroup, IconButton } = findByProps("TableRow");
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
    /** @deprecated use overflowActions */
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
                        {props.overflowActions &&
                            <ContextMenu
                                triggerOnLongPress={false}
                                items={props.overflowActions.map(i => ({ 
                                    label: i.label,
                                    iconSource: getAssetIDByName(i.icon),
                                    action: i.onPress
                                }))}
                                align="below"
                                title={props.overflowTitle!!}
                                children={(props) => <IconButton
                                    {...props}
                                    size="sm"
                                    variant="secondary"
                                    icon={getAssetIDByName("more_horizontal")} 
                                />}
                            />
                        }
                    </RN.View>
                }
            />
            </TableRowGroup>
        </RN.View>
    )
}
