import { getAssetIDByName } from "@lib/api/assets";
import { FormText } from "@lib/ui/components/discord/Forms";
import { TableRow } from "@lib/ui/components/discord/Redesign";
import { clipboard } from "@metro/common";
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
            icon={<TableRow.Icon source={getAssetIDByName(icon)} />}
            trailing={<FormText>{version}</FormText>}
            onPress={() => {
                clipboard.setString(`${label} - ${version}`);
                showToast.showCopyToClipboard();
            }}
        />
    );
}
