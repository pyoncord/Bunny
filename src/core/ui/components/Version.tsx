import { requireAssetIndex } from "@lib/api/assets";
import { clipboard } from "@metro/common";
import { FormText } from "@ui/components/discord/Forms";
import { TableRow } from "@ui/components/discord/Redesign";
import { showToast } from "@ui/toasts";

interface VersionProps {
    label: string;
    version: string;
    icon: string;
}

export default function Version({ label, version, icon }: VersionProps) {
    return (
        <TableRow
            label={label}
            icon={<TableRow.Icon source={requireAssetIndex(icon)} />}
            trailing={<FormText>{version}</FormText>}
            onPress={() => {
                clipboard.setString(`${label} - ${version}`);
                showToast.showCopyToClipboard();
            }}
        />
    );
}
