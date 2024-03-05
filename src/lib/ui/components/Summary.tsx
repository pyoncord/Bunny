import { getAssetIDByName } from "@lib/api/assets";
import { findByProps } from "@lib/metro/filters";
import { ReactNative as RN } from "@metro/common";

const { FormRow } = findByProps("FormRow");
const { TableRow } = findByProps("TableRow");
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
                icon={icon && <TableRow.Icon source={getAssetIDByName(icon)} />}
                trailing={<FormRow.Arrow style={{ transform: [{ rotate: `${hidden ? 180 : 90}deg` }] }} />}
                onPress={() => {
                    setHidden(!hidden);
                    if (!noAnimation) RN.LayoutAnimation.configureNext(RN.LayoutAnimation.Presets.easeInEaseOut);
                }}
            />
            {!hidden && <>
                <RN.View style={!noPadding && { paddingHorizontal: 15 }}>{children}</RN.View>
            </>}
        </>
    );
}
