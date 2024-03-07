import { Asset } from "@lib/api/assets";
import { FormRow } from "@lib/ui/components/discord/Forms";
import { clipboard } from "@metro/common";
import { showToast } from "@ui/toasts";
import { Image } from "react-native";

interface AssetDisplayProps { asset: Asset; }

export default function AssetDisplay({ asset }: AssetDisplayProps) {
    return (
        <FormRow
            label={`${asset.name} - ${asset.id}`}
            trailing={<Image source={asset.id} style={{ width: 32, height: 32 }} />}
            onPress={() => {
                clipboard.setString(asset.name);
                showToast.showCopyToClipboard();
            }}
        />
    );
}
