import { Asset } from "@lib/api/assets";
import { clipboard, ReactNative as RN } from "@metro/common";
import { Forms } from "@ui/components";
import { showToast } from "@ui/toasts";

interface AssetDisplayProps { asset: Asset; }

const { FormRow } = Forms;

export default function AssetDisplay({ asset }: AssetDisplayProps) {
    return (
        <FormRow
            label={`${asset.name} - ${asset.id}`}
            trailing={<RN.Image source={asset.id} style={{ width: 32, height: 32 }} />}
            onPress={() => {
                clipboard.setString(asset.name);
                showToast.showCopyToClipboard();
            }}
        />
    );
}
