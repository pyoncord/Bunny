import { formatString, Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import FontCard from "@core/ui/components/FontCard";
import { getAssetIDByName } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { FontDefinition, fonts, installFont, saveFont } from "@lib/managers/fonts";
import { getCurrentTheme } from "@lib/managers/themes";
import { findByProps } from "@lib/metro/filters";
import { settings } from "@lib/settings";
import { ErrorBoundary } from "@lib/ui/components";
import { FormText } from "@lib/ui/components/discord/Forms";
import { ActionSheet, BottomSheetTitleHeader, Button, RowButton, TableRow, Text, TextInput, useNavigation } from "@lib/ui/components/discord/Redesign";
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
        return name.length < shortest.length ? name : shortest;
    }, fileNames[0] || "");

    return shortest?.replace(/-[A-Za-z]*$/, "") || null;
}

function ExtractFontsComponent({ fonts }: { fonts: Record<string, string>; }) {
    const [fontName, setFontName] = useState(guessFontName(Object.values(fonts)));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | void>(undefined);

    return <View style={{ padding: 8, paddingBottom: 16, gap: 12 }}>
        <TextInput
            size="md"
            label={Strings.FONT_NAME}
            value={fontName}
            placeholder={fontName || "Whitney"}
            onChange={setFontName}
            errorMessage={error}
            status={error ? "error" : void 0}
        />
        <Text variant="text-xs/normal" color="text-muted">
            {formatString("THEME_EXTRACTOR_DESC", {
                fonts: Object.keys(fonts).join(Strings.SEPARATOR)
            })}
        </Text>
        <Button
            size="md"
            variant="primary"
            text={Strings.EXTRACT}
            disabled={!fontName || saving}
            loading={saving}
            onPress={() => {
                setSaving(true);
                saveFont({
                    spec: 1,
                    name: fontName!.trim(),
                    main: fonts
                })
                    .then(() => actionSheet.hideActionSheet())
                    .catch(e => setError(String(e)))
                    .finally(() => setSaving(false));
            }}
        />
    </View>;
}

function promptFontExtractor() {
    const currentTheme = getCurrentTheme()?.data;
    if (!currentTheme || !("fonts" in currentTheme)) return;

    const fonts = currentTheme.fonts as Record<string, string>;

    actionSheet.openLazy(
        Promise.resolve({
            default: () => (
                <ErrorBoundary>
                    <ActionSheet>
                        <BottomSheetTitleHeader title={Strings.LABEL_EXTRACT_FONTS_FROM_THEME} />
                        <ExtractFontsComponent fonts={fonts} />
                    </ActionSheet>
                </ErrorBoundary>
            )
        }),
        "FontsFromThemeExtractorActionSheet"
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
                {/* @ts-ignore */}
                {getCurrentTheme()?.data?.fonts && <View style={{ marginVertical: 8 }}>
                    <RowButton
                        label={Strings.LABEL_EXTRACT_FONTS_FROM_THEME}
                        subLabel={Strings.DESC_EXTRACT_FONTS_FROM_THEME}
                        icon={<TableRow.Icon source={getAssetIDByName("HammerIcon")} />}
                        onPress={promptFontExtractor}
                    />
                </View>}
            </>}
        />
    );
}
