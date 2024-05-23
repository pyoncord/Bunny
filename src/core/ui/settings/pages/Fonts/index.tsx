import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import FontImporter from "@core/ui/settings/pages/Fonts/FontImporter";
import { useProxy } from "@lib/api/storage";
import { FontDefinition, fonts, installFont } from "@lib/managers/fonts";
import { settings } from "@lib/settings";
import { NavigationNative } from "@metro/common";
import { LegacyFormText } from "@metro/common/components";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";

import FontCard from "./FontCard";

export default function Plugins() {
    useProxy(settings);
    useProxy(fonts);

    const [removeMode, setRemoveMode] = useState(false);

    const navigation = NavigationNative.useNavigation();

    useEffect(() => {
        const onPressCallback = () => {
            setRemoveMode(x => !x);
        };

        navigation.setOptions({
            headerRight: () => <TouchableOpacity onPress={onPressCallback}>
                <LegacyFormText style={{ marginRight: 12 }}>
                    {removeMode ? Strings.DONE : Strings.REMOVE}
                </LegacyFormText>
            </TouchableOpacity>
        });
    }, [removeMode]);

    return (
        <AddonPage<FontDefinition>
            title={Strings.FONTS}
            fetchFunction={installFont}
            items={fonts as Record<string, FontDefinition>}
            safeModeMessage={Strings.SAFE_MODE_NOTICE_FONTS}
            isRemoveMode={removeMode}
            card={FontCard}
            onFABPress={() => {
                navigation.push("VendettaCustomPage", {
                    title: "Font Importer",
                    render: () => <FontImporter />
                });
            }}
        />
    );
}
