import { findAssetId } from "@lib/api/assets";
import { LegacyFormRow, TableRow } from "@metro/common/components";
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
                icon={icon && <TableRow.Icon source={findAssetId(icon)} />}
                trailing={<LegacyFormRow.Arrow style={{ transform: [{ rotate: `${hidden ? 180 : 90}deg` }] }} />}
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
