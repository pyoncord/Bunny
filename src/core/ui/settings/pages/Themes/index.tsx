import { formatString, Strings } from "@core/i18n";
import AddonPage from "@core/ui/components/AddonPage";
import ThemeCard from "@core/ui/settings/pages/Themes/ThemeCard";
import { useProxy } from "@lib/api/storage";
import { installTheme, Theme, themes } from "@lib/managers/themes";
import { settings } from "@lib/settings";
import { Author } from "@lib/utils/types";
import { Button } from "@metro/common/components";

export default function Themes() {
    useProxy(settings);
    useProxy(themes);

    return (
        <AddonPage<Theme>
            title={Strings.THEMES}
            searchKeywords={[
                "manifest.name",
                "manifest.description",
                p => p.manifest.authors?.map((a: Author) => a.name).join()
            ]}
            fetchFunction={installTheme}
            items={themes}
            safeModeMessage={formatString("SAFE_MODE_NOTICE_THEMES", { enabled: Boolean(settings.safeMode?.currentThemeId) })}
            safeModeExtras={settings.safeMode?.currentThemeId ? <Button
                text={Strings.DISABLE_THEME}
                size="small"
                onPress={() => delete settings.safeMode?.currentThemeId}
                style={{ marginTop: 8 }}
            /> : undefined}
            card={ThemeCard}
        />
    );
}
