import { ReactNative as RN, NavigationNative, stylesheet, lodash } from "@metro/common";
import { installPlugin } from "@lib/managers/plugins";
import { installTheme } from "@lib/managers/themes";
import { showConfirmationAlert } from "@ui/alerts";
import { semanticColors } from "@ui/color";
import { showToast } from "@ui/toasts";
import { without } from "@lib/utils";
import { getAssetIDByName } from "@/lib/api/assets";
import { settings } from "@lib/settings";
import ErrorBoundary from "@ui/components/ErrorBoundary";
import InstallButton from "@ui/settings/components/InstallButton";
import General from "@ui/settings/pages/General";
import Plugins from "@ui/settings/pages/Plugins";
import Themes from "@ui/settings/pages/Themes";
import Developer from "@ui/settings/pages/Developer";
import { PROXY_PREFIX } from "@/lib/utils/constants";
import { findByProps } from "@/lib/metro/filters";
import { isThemeSupported } from "@/lib/api/native/loader";
import { Strings } from "@/core/i18n";
import { useProxy } from "@/lib/api/storage";

const { useSafeAreaInsets } = findByProps("useSafeAreaInsets");

interface Screen {
    [index: string]: any;
    key: string;
    title: string;
    icon?: string;
    shouldRender?: () => boolean;
    options?: Record<string, any>;
    render: React.ComponentType<any>;
}

const useStyles = stylesheet.createStyles({ 
    container: { 
        flex: 1,
        backgroundColor: semanticColors.BACKGROUND_MOBILE_PRIMARY 
    }
});

// If a function is passed, it is called with the screen object, and the return value is mapped. If a string is passed, we map to the value of the property with that name on the screen. Else, just map to the given data.
// Question: Isn't this overengineered?
// Answer: Maybe.
const keyMap = (screens: Screen[], data: string | ((s: Screen) => any) | null) => Object.fromEntries(screens.map(s => [s.key, typeof data === "function" ? data(s) : typeof data === "string" ? s[data] : data]));

export const getScreens = (): Screen[] => [
    {
        key: "VendettaSettings",
        title: Strings.GENERAL,
        icon: "settings",
        render: General,
    },
    {
        key: "VendettaPlugins",
        title: Strings.PLUGINS,
        icon: "debug",
        options: {
            headerRight: () => (
                <InstallButton
                    alertTitle={Strings.INSTALL_PLUGIN}
                    installFunction={async (input) => {
                        if (!input.startsWith(PROXY_PREFIX) && !settings.developerSettings)
                            setImmediate(() => showConfirmationAlert({
                                title: Strings.MODAL_UNPROXIED_PLUGIN_HEADER,
                                content: Strings.MODAL_UNPROXIED_PLUGIN_DESC,
                                confirmText: Strings.INSTALL,
                                onConfirm: () =>
                                    installPlugin(input)
                                        .then(() => showToast(Strings.TOASTS_INSTALLED_PLUGIN, getAssetIDByName("Check")))
                                        .catch((x: any) => showToast(x?.message ?? `${x}`, getAssetIDByName("Small"))),
                                cancelText: Strings.CANCEL,
                            }));
                        else return await installPlugin(input);
                    }}
                />
            ),
        },
        render: Plugins,
    },
    {
        key: "VendettaThemes",
        title: Strings.THEMES,
        icon: "ic_theme_24px",
        // TODO: bad
        shouldRender: () => isThemeSupported(),
        options: {
            headerRight: () => !settings.safeMode?.enabled && <InstallButton alertTitle={Strings.INSTALL_THEME} installFunction={installTheme} />,
        },
        render: Themes,
    },
    {
        key: "VendettaDeveloper",
        title: Strings.DEVELOPER,
        icon: "ic_progress_wrench_24px",
        shouldRender: () => settings.developerSettings ?? false,
        render: Developer,
    },
    {
        key: "VendettaCustomPage",
        title: "Vendetta Page",
        shouldRender: () => false,
        render: ({ render: PageView, noErrorBoundary, ...options }: { render: React.ComponentType; noErrorBoundary: boolean } & Record<string, object>) => {
            const navigation = NavigationNative.useNavigation();

            navigation.addListener("focus", () => navigation.setOptions(without(options, "render", "noErrorBoundary")));
            return noErrorBoundary ? <PageView /> : <ErrorBoundary><PageView /></ErrorBoundary>
        },
    },
];

export const getPanelsScreens = () => keyMap(getScreens(), (s) => ({
    title: s.title,
    render: s.render,
    ...s.options,
}));

export const getYouData = () => {
    const screens = getScreens();

    return {
        getLayout: () => ({
            // This is an old key, keeping it as "Vendetta" is good as some plugins actually checks
            // to determine if this section is Vendetta's
            title: "Vendetta",
            label: Strings.BUNNY,
            // We can't use our keyMap function here since `settings` is an array not an object
            settings: screens.map(s => s.key)
        }),
        titleConfig: keyMap(screens, "title"),
        relationships: keyMap(screens, null),
        rendererConfigs: keyMap(screens, (s) => {
            const WrappedComponent = React.memo(({ navigation, route }: any) => {
                const styles = useStyles();
                const { bottom: paddingBottom } = useSafeAreaInsets();
                navigation.addListener("focus", () => navigation.setOptions(s.options));
                return <RN.View style={[{ paddingBottom }, styles.container]}><s.render {...route.params} /></RN.View>
            });

            return {
                type: "route",
                title: () => s.title,
                icon: s.icon ? getAssetIDByName(s.icon) : null,
                usePredicate: s.shouldRender && (() => useProxy(settings) && s.shouldRender!!()),
                screen: {
                    route: s.key,
                    getComponent: () => WrappedComponent,
                }
            }
        }),
    };
};
