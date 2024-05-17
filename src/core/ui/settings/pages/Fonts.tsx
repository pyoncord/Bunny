import { Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import FontCard from "@core/ui/components/FontCard";
import { useProxy } from "@lib/api/storage";
import { FontDefinition, fonts, installFont, saveFont } from "@lib/managers/fonts";
import { findByProps } from "@lib/metro/filters";
import { settings } from "@lib/settings";
import { ErrorBoundary } from "@lib/ui/components";
import { FormText } from "@lib/ui/components/discord/Forms";
import { ActionSheet, BottomSheetTitleHeader, Button, RowButton, TableRow, TextInput, useNavigation } from "@lib/ui/components/discord/Redesign";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";

const actionSheet = findByProps("hideActionSheet");

function guessFontName(urls: string[]) {
    const fileNames = urls.map(url => {
        const { pathname } = new URL(url);
        const fileName = pathname.replace(/\.[^/.]+$/, "");
        return fileName.split("/").pop();
    }).filter(Boolean) as string[];

    const shortest = fileNames.reduce((shortest, name) => {
        if (name.length < shortest.length) {
            return name;
        }
        return shortest;
    }, fileNames[0] || "");

    return shortest || null;
}

function ExtractFontsComponent({ fonts }: { fonts: Record<string, string>; }) {
    const [fontName, setFontName] = useState("");

    return <View style={{ padding: 8, paddingBottom: 16, gap: 12 }}>
        <TextInput
            size="md"
            label={Strings.FONT_NAME}
            value={fontName}
            placeholder={guessFontName(Object.values(fonts)) || "Whitney"}
            defaultValue={settings.debuggerUrl}
            onChange={setFontName}
        />
        <Button
            size="md"
            variant={"primary"}
            text={Strings.EXTRACT}
            disabled={!fontName}
            onPress={() => {
                saveFont({
                    spec: 1,
                    name: fontName,
                    main: fonts
                });
                actionSheet.hideActionSheet();
            }}
        />
    </View>;
}

function promptFontExtractor() {
    const currentTheme = {
        fonts: {
            "ggsans-Bold": "https://github.com/acquitelol/rosiecord/raw/master/Fonts/ttf/Quicksand/ggsans-700-bold.ttf",
            "ggsans-BoldItalic": "https://github.com/acquitelol/rosiecord/raw/master/Fonts/ttf/Quicksand/ggsans-700-bolditalic.ttf",
            "ggsans-ExtraBold": "https://github.com/acquitelol/rosiecord/raw/master/Fonts/ttf/Quicksand/ggsans-800-extrabold.ttf",
            "ggsans-ExtraBoldItalic": "https://github.com/acquitelol/rosiecord/raw/master/Fonts/ttf/Quicksand/ggsans-700-bolditalic.ttf",
            "ggsans-Medium": "https://github.com/acquitelol/rosiecord/raw/master/Fonts/ttf/Quicksand/ggsans-500-medium.ttf",
            "ggsans-MediumItalic": "https://github.com/acquitelol/rosiecord/raw/master/Fonts/ttf/Quicksand/ggsans-400-normalitalic.ttf",
            "ggsans-Normal": "https://github.com/acquitelol/rosiecord/raw/master/Fonts/ttf/Quicksand/ggsans-400-normal.ttf",
            "ggsans-NormalItalic": "https://github.com/acquitelol/rosiecord/raw/master/Fonts/ttf/Quicksand/ggsans-400-normalitalic.ttf",
            "ggsans-Semibold": "https://github.com/acquitelol/rosiecord/raw/master/Fonts/ttf/Quicksand/ggsans-600-semibold.ttf",
            "ggsans-SemiboldItalic": "https://github.com/acquitelol/rosiecord/raw/master/Fonts/ttf/Quicksand/ggsans-700-bolditalic.ttf"
        }
    };

    if (!currentTheme || !("fonts" in currentTheme)) return;

    const fonts = currentTheme.fonts as Record<string, string>;

    actionSheet.openLazy(
        Promise.resolve({
            default: () => (
                <ErrorBoundary>
                    <ActionSheet>
                        <BottomSheetTitleHeader title={Strings.EXTRACT_FONTS_FROM_THEME} />
                        <ExtractFontsComponent fonts={fonts} />
                    </ActionSheet>
                </ErrorBoundary>
            )
        }),
        "ExtractFontsFromThemeActionSheet"
    );
}

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
            floatingButtonText={Strings.INSTALL_FONT}
            fetchFunction={installFont}
            items={fonts as Record<string, FontDefinition>}
            safeModeMessage={Strings.SAFE_MODE_NOTICE_FONTS}
            isRemoveMode={removeMode}
            card={FontCard}
            headerComponent={<>
                <RowButton
                    label={Strings.EXTRACT_FONTS_FROM_THEME}
                    subLabel={Strings.EXTRACT_FONTS_FROM_THEME_DESC}
                    icon={<TableRow.Icon source={123} />}
                    onPress={promptFontExtractor}
                />
            </>}
        />
    );
}
