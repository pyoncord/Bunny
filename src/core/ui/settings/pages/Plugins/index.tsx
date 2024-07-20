import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import PluginCard from "@core/ui/settings/pages/Plugins/PluginCard";
import { VdPluginManager, VendettaPlugin } from "@core/vendetta/plugins";
import { useProxy } from "@lib/api/storage";
import { settings } from "@lib/settings";
import { Author } from "@lib/utils/types";

export default function Plugins() {
    useProxy(settings);

    return (
        <AddonPage<VendettaPlugin>
            title={Strings.PLUGINS}
            searchKeywords={[
                "manifest.name",
                "manifest.description",
                p => p.manifest.authors?.map((a: Author) => a.name).join()
            ]}
            items={VdPluginManager.plugins}
            fetchFunction={VdPluginManager.installPlugin.bind(VdPluginManager)}
            safeModeMessage={Strings.SAFE_MODE_NOTICE_PLUGINS}
            card={PluginCard}
        />
    );
}
