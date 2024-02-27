import { useProxy } from "@lib/storage";
import { Theme, installTheme, themes } from "@lib/themes";
import { Button } from "@ui/components";
import settings from "@lib/settings";
import AddonPage from "@ui/settings/components/AddonPage";
import ThemeCard from "@ui/settings/components/ThemeCard";
import { ButtonColors } from "@/lib/types";
import { Strings } from "@/lib/i18n";

export default function Themes() {
    useProxy(settings);

    return (
        <AddonPage<Theme>
            title={Strings.THEMES}
            fetchFunction={installTheme}
            items={themes}
            safeModeMessage={`${Strings.SAFE_MODE_NOTICE_THEMES}${settings.safeMode?.currentThemeId ? ` ${Strings.SAFE_MODE_NOTICE_THEMES_EXTEND}` : ""}`}
            safeModeExtras={settings.safeMode?.currentThemeId ? <Button
                text={Strings.DISABLE_THEME}
                color={ButtonColors.BRAND}
                size="small"
                onPress={() => {
                    delete settings.safeMode?.currentThemeId;
                }}
                style={{ marginTop: 8 }}
            /> : undefined}
            card={ThemeCard}
        />
    )
}