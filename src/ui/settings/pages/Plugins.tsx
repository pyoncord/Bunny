import { useProxy } from "@lib/storage";
import { Plugin, installPlugin, plugins } from "@lib/plugins";
import settings from "@lib/settings";
import AddonPage from "@ui/settings/components/AddonPage";
import PluginCard from "@ui/settings/components/PluginCard";

export default function Plugins() {
    useProxy(settings)

    return (
        <AddonPage<Plugin>
            title="Plugin"
            fetchFunction={installPlugin}
            items={plugins}
            safeModeMessage="You are in Safe Mode, so plugins cannot be loaded. Disable any misbehaving plugins, then return to Normal Mode from the General settings page."
            card={PluginCard}
        />
    )
}