import { after } from "@lib/api/patcher";
import { findInReactTree } from "@lib/utils";
import { i18n } from "@metro/common";
import { findByNameLazy, findByPropsLazy } from "@metro/wrappers";
import { registeredSections } from "@ui/settings";

import { CustomPageRenderer, wrapOnPress } from "./shared";

const settingConstants = findByPropsLazy("SETTING_RENDERER_CONFIG");
const SettingsOverviewScreen = findByNameLazy("SettingsOverviewScreen", false);

function useIsFirstRender() {
    let firstRender = false;
    React.useEffect(() => void (firstRender = true), []);
    return firstRender;
}

export function patchTabsUI(unpatches: (() => void | boolean)[]) {
    const getRows = () => Object.values(registeredSections)
        .flatMap(sect => sect.map(row => ({
            [row.key]: {
                type: "pressable",
                title: row.title,
                icon: row.icon,
                usePredicate: row.usePredicate,
                useTrailing: row.useTrailing,
                onPress: wrapOnPress(row.onPress, null, row.render, row.title()),
                withArrow: true,
                ...row.rawTabsConfig
            }
        })))
        .reduce((a, c) => Object.assign(a, c));

    const origRendererConfig = settingConstants.SETTING_RENDERER_CONFIG;
    let rendererConfigValue = settingConstants.SETTING_RENDERER_CONFIG;

    Object.defineProperty(settingConstants, "SETTING_RENDERER_CONFIG", {
        enumerable: true,
        configurable: true,
        get: () => ({
            ...rendererConfigValue,
            VendettaCustomPage: {
                type: "route",
                title: () => "Bunny",
                screen: {
                    route: "VendettaCustomPage",
                    getComponent: () => CustomPageRenderer
                }
            },
            BUNNY_CUSTOM_PAGE: {
                type: "route",
                title: () => "Bunny",
                screen: {
                    route: "BUNNY_CUSTOM_PAGE",
                    getComponent: () => CustomPageRenderer
                }
            },
            ...getRows()
        }),
        set: v => rendererConfigValue = v,
    });

    unpatches.push(() => {
        Object.defineProperty(settingConstants, "SETTING_RENDERER_CONFIG", {
            value: origRendererConfig,
            writable: true,
            get: undefined,
            set: undefined
        });
    });

    unpatches.push(after("default", SettingsOverviewScreen, (_, ret) => {
        if (useIsFirstRender()) return; // :shrug:

        const { sections } = findInReactTree(ret, i => i.props?.sections).props;
        let index = -~sections.findIndex((i: any) => i.label === i18n.Messages.ACCOUNT_SETTINGS) || 1;

        Object.keys(registeredSections).forEach(sect => {
            sections.splice(index++, 0, {
                label: sect,
                title: sect,
                settings: registeredSections[sect].map(a => a.key)
            });
        });
    }));
}
