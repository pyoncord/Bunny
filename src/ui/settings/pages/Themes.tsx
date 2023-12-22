import { Theme, ButtonColors } from "@types";
import { useProxy } from "@lib/storage";
import { installTheme, themes } from "@lib/themes";
import { Button } from "@ui/components";
import settings from "@lib/settings";
import AddonPage from "@ui/settings/components/AddonPage";
import ThemeCard from "@ui/settings/components/ThemeCard";

export default function Themes() {
    useProxy(settings);

    return (
        <AddonPage<Theme>
            title={"Theme"}
            fetchFunction={installTheme}
            items={themes}
            safeModeMessage={`You are in Safe Mode, meaning themes have been temporarily disabled.${settings.safeMode?.currentThemeId ? " If a theme appears to be causing the issue, you can press below to disable it persistently." : ""}`}
            safeModeExtras={settings.safeMode?.currentThemeId ? <Button
                text="Disable Theme"
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