import { getAssetIDByName } from "@lib/api/assets";
import { TableCheckboxRow, TableRow, TableRowGroup, TableRowIcon, TableSwitchRow } from "@lib/ui/components/discord/Redesign";
import { semanticColors } from "@ui/color";
import ContextMenu from "@ui/components/ContextMenu";
import { createStyles } from "@ui/styles";
import { Image, TouchableOpacity, View } from "react-native";

// TODO: These styles work weirdly. iOS has cramped text, Android with low DPI probably does too. Fix?
const useStyles = createStyles({
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
    icon: {
        width: 22,
        height: 22,
        marginLeft: 5,
        tintColor: semanticColors?.INTERACTIVE_NORMAL,
    }
});

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
    overflowIcon?: string;
}

export default function Card(props: CardProps) {
    const styles = useStyles();
    let pressableState = props.toggleValue ?? false;

    const headerProps = {
        style: styles.header,
        label: props.headerLabel,
        icon: props.headerIcon && <TableRowIcon source={getAssetIDByName(props.headerIcon)} />
    };

    return (
        <View style={[styles.card, { marginTop: props.index !== 0 ? 10 : 0 }]}>
            <TableRowGroup>
                {props.toggleType && (props.toggleType === "switch" ?
                    <TableSwitchRow
                        {...headerProps}
                        value={props.toggleValue}
                        onValueChange={props.onToggleChange}
                    /> : props.toggleType === "radio" ?
                        <TableCheckboxRow
                            {...headerProps}
                            onPress={() => {
                                pressableState = !pressableState;
                                props.onToggleChange?.(pressableState);
                            }}
                            checked={props.toggleValue}
                        /> : undefined) || <TableRow {...headerProps} />}
                <TableRow
                    label={props.descriptionLabel}
                    trailing={
                        <View style={styles.actions}>
                            {props.overflowActions &&
                                <ContextMenu
                                    triggerOnLongPress={false}
                                    items={props.overflowActions.map(i => ({
                                        label: i.label,
                                        iconSource: getAssetIDByName(i.icon),
                                        action: i.onPress
                                    }))}
                                    align="auto"
                                    title={props.overflowTitle!!}
                                    children={props => <TouchableOpacity {...props}>
                                        <Image style={styles.icon} source={getAssetIDByName("ic_more_24px")} />
                                    </TouchableOpacity>}
                                />
                            }
                        </View>
                    }
                />
            </TableRowGroup>
        </View>
    );
}
