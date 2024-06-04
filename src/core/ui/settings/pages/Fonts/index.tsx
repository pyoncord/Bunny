import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import FontEditor from "@core/ui/settings/pages/Fonts/FontEditor";
import { useProxy } from "@lib/api/storage";
import { FontDefinition, fonts, installFont } from "@lib/managers/fonts";
import { settings } from "@lib/settings";
import { NavigationNative } from "@metro/common";

import FontCard from "./FontCard";

export default function Fonts() {
    useProxy(settings);
    useProxy(fonts);

    const navigation = NavigationNative.useNavigation();

    return (
        <AddonPage<FontDefinition>
            title={Strings.FONTS}
            searchKeywords={["name", "description"]}
            fetchFunction={installFont}
            items={fonts as Record<string, FontDefinition>}
            safeModeMessage={Strings.SAFE_MODE_NOTICE_FONTS}
            card={FontCard}
            onFABPress={() => {
                navigation.push("VendettaCustomPage", {
                    title: "Import Font",
                    render: () => <FontEditor />
                });
            }}
        />
    );
}
