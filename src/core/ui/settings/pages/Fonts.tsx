import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import FontCard from "@core/ui/components/FontCard";
import { useProxy } from "@lib/api/storage";
import { FontDefinition, fonts, installFont } from "@lib/managers/fonts";
import { settings } from "@lib/settings";

export default function Plugins() {
    useProxy(settings);
    useProxy(fonts);

    return (
        <AddonPage<FontDefinition>
            title={Strings.PLUGINS}
            floatingButtonText={Strings.INSTALL_PLUGIN}
            fetchFunction={installFont}
            items={fonts as Record<string, FontDefinition>}
            safeModeMessage={Strings.SAFE_MODE_NOTICE_PLUGINS}
            card={FontCard}
        />
    );
}
