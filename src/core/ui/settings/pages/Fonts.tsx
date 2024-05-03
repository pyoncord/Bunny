import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import FontCard from "@core/ui/components/FontCard";
import { useProxy } from "@lib/api/storage";
import { FontDefinition, fonts, installFont } from "@lib/managers/fonts";
import { settings } from "@lib/settings";
import { FormText } from "@lib/ui/components/discord/Forms";
import { useNavigation } from "@lib/ui/components/discord/Redesign";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";

export default function Plugins() {
    useProxy(settings);
    useProxy(fonts);

    const [removeMode, setRemoveMode] = useState(false);

    const navigation = useNavigation();

    useEffect(() => {
        const onPressCallback = () => {
            setRemoveMode(x => !x);
        };

        navigation.setOptions({
            headerRight: () => <TouchableOpacity onPress={onPressCallback}>
                <FormText style={{ marginRight: 12 }}>
                    {removeMode ? Strings.DONE : Strings.REMOVE}
                </FormText>
            </TouchableOpacity>
        });
    }, [removeMode]);

    return (
        <AddonPage<FontDefinition>
            title={Strings.FONTS}
            floatingButtonText={Strings.INSTALL_PLUGIN}
            fetchFunction={installFont}
            items={fonts as Record<string, FontDefinition>}
            safeModeMessage={Strings.SAFE_MODE_NOTICE_FONTS}
            isRemoveMode={removeMode}
            card={FontCard}
        />
    );
}
