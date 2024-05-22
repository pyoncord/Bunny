import { requireAssetIndex } from "@lib/api/assets";
import { FormRow } from "@ui/components/discord/Forms";
import { TableRow } from "@ui/components/discord/Redesign";
import { LayoutAnimation, View } from "react-native";

export interface SummaryProps {
    label: string;
    icon?: string;
    noPadding?: boolean;
    noAnimation?: boolean;
    children: JSX.Element | JSX.Element[];
}

export default function Summary({ label, icon, noPadding = false, noAnimation = false, children }: SummaryProps) {
    const [hidden, setHidden] = React.useState(true);

    return (
        <>
            <TableRow
                label={label}
                icon={icon && <TableRow.Icon source={requireAssetIndex(icon)} />}
                trailing={<FormRow.Arrow style={{ transform: [{ rotate: `${hidden ? 180 : 90}deg` }] }} />}
                onPress={() => {
                    setHidden(!hidden);
                    if (!noAnimation) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }}
            />
            {!hidden && <>
                <View style={!noPadding && { paddingHorizontal: 15 }}>{children}</View>
            </>}
        </>
    );
}
