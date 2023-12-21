import { clipboard } from "@metro/common";
import { getAssetIDByName } from "@ui/assets";
import { showToast } from "@ui/toasts";
import { Forms } from "@ui/components";
import { findByProps } from "@/lib/metro/filters";

interface VersionProps {
    label: string;
    version: string;
    icon: string;
    padding: boolean;
}

const { TableRow } = findByProps("TableRow");
const { FormText } = Forms;

export default function Version({ label, version, icon, padding }: VersionProps) {
    return ( 
        <TableRow
            style={padding && { paddingHorizontal: 15, paddingVertical: -15 }}
            label={label}
            icon={<TableRow.Icon source={getAssetIDByName(icon)} />}
            trailing={<FormText>{version}</FormText>}
            onPress={() => {
                clipboard.setString(`${label} - ${version}`);
                showToast.showCopyToClipboard();
            }}
        />
    )
}