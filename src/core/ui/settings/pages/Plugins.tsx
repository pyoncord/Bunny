import { useProxy } from "@/lib/api/storage";
import { BunnyPlugin, installPlugin, plugins } from "@lib/managers/plugins";
import { settings } from "@lib/settings";
import AddonPage from "@/core/ui/components/AddonPage";
import PluginCard from "@/core/ui/components/PluginCard";
import { Strings } from "@/core/i18n";

export default function Plugins() {
    useProxy(settings)

    return (
        <AddonPage<BunnyPlugin>
            title={Strings.PLUGINS}
            fetchFunction={installPlugin}
            items={plugins}
            safeModeMessage={Strings.SAFE_MODE_NOTICE_PLUGINS}
            card={PluginCard}
        />
    )
}