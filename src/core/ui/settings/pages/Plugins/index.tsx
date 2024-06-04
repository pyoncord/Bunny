import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import PluginCard from "@core/ui/settings/pages/Plugins/PluginCard";
import { useProxy } from "@lib/api/storage";
import { BunnyPlugin, installPlugin, plugins } from "@lib/managers/plugins";
import { settings } from "@lib/settings";
import { Author } from "@lib/utils/types";

export default function Plugins() {
    useProxy(settings);

    return (
        <AddonPage<BunnyPlugin>
            title={Strings.PLUGINS}
            searchKeywords={[
                "manifest.name",
                "manifest.description",
                p => p.manifest.authors?.map((a: Author) => a.name).join()
            ]}
            fetchFunction={installPlugin}
            items={plugins}
            safeModeMessage={Strings.SAFE_MODE_NOTICE_PLUGINS}
            card={PluginCard}
        />
    );
}
