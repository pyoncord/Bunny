import { Strings } from "@core/i18n";
import { getAssetIDByName } from "@lib/api/assets";
import { isFontSupported, isThemeSupported } from "@lib/api/native/loader";
import { useProxy } from "@lib/api/storage";
import { settings } from "@lib/settings";
import { registerSection } from "@ui/settings";
import { version } from "bunny-build";

// @ts-ignore
// eslint-disable-next-line import-alias/import-alias
import _PyoncordIcon from "../../../assets/icons/pyon64.png";

export const PyoncordIcon = _PyoncordIcon as string;

export default function initSettings() {
    registerSection({
        name: "Bunny",
        items: [
            {
                key: "BUNNY",
                title: () => Strings.BUNNY,
                icon: { uri: PyoncordIcon },
                render: () => import("@core/ui/settings/pages/General"),
                rawTabsConfig: {
                    useTrailing: () => `(${version})`
                }
            },
            {
                key: "BUNNY_PLUGINS",
                title: () => Strings.PLUGINS,
                icon: getAssetIDByName("ActivitiesIcon"),
                render: () => import("@core/ui/settings/pages/Plugins")
            },
            {
                key: "BUNNY_THEMES",
                title: () => Strings.THEMES,
                icon: getAssetIDByName("PaintPaletteIcon"),
                render: () => import("@core/ui/settings/pages/Themes"),
                usePredicate: () => isThemeSupported()
            },
            {
                key: "BUNNY_FONTS",
                title: () => Strings.FONTS,
                icon: getAssetIDByName("ic_add_text"),
                render: () => import("@core/ui/settings/pages/Fonts"),
                usePredicate: () => isFontSupported()
            },
            {
                key: "BUNNY_DEVELOPER",
                title: () => Strings.DEVELOPER,
                icon: getAssetIDByName("WrenchIcon"),
                render: () => import("@core/ui/settings/pages/Developer"),
                usePredicate: () => useProxy(settings).developerSettings ?? false
            }
        ]
    });

    // Compat for plugins which injects into the settings
    // Flaw: in the old UI, this will be displayed anyway with no items
    registerSection({
        name: "Vendetta",
        items: []
    });
}
