import { findInReactTree } from "@lib/utils";
import { i18n } from "@metro/common";
import { findByName, findByProps } from "@metro/utils";
import { registeredSections } from "@ui/settings";
import { after } from "spitroast";

import { CustomPageRenderer, wrapOnPress } from "./shared";

const settingConstants = findByProps("SETTING_RENDERER_CONFIG");
const SettingsOverviewScreen = findByName("SettingsOverviewScreen", false);

function useIsFirstRender() {
    let firstRender = false;
    React.useEffect(() => void (firstRender = true), []);
    return firstRender;
}

export function patchTabsUI(unpatches: (() => void | boolean)[]) {
    settingConstants.SETTING_RENDERER_CONFIG.VendettaCustomPage = {
        type: "route",
        title: () => "Bunny",
        screen: {
            route: "VendettaCustomPage",
            getComponent: () => CustomPageRenderer
        }
    };

    const getRows = () => Object.values(registeredSections)
        .flatMap(sect => sect.map(row => ({
            [row.key]: {
                type: "pressable",
                title: row.title,
                icon: row.icon,
                usePredicate: row.usePredicate,
                onPress: wrapOnPress(row.onPress, null, row.render, row.title()),
                withArrow: true,
                ...row.rawTabsConfig
            }
        })))
        .reduce((a, c) => Object.assign(a, c));

    const origRendererConfig = settingConstants.SETTING_RENDERER_CONFIG;
    settingConstants.SETTING_RENDERER_CONFIG = new Proxy(origRendererConfig, {
        get: (target, prop: string, reciever) => Reflect.get({ ...target, ...getRows() }, prop, reciever),
        getOwnPropertyDescriptor: (target, prop: string) => Reflect.getOwnPropertyDescriptor({ ...target, ...getRows() }, prop),
        ownKeys: target => [...Reflect.ownKeys(target), ...Object.keys(getRows())]
    });

    unpatches.push(() => {
        settingConstants.SETTING_RENDERER_CONFIG = origRendererConfig;
        delete settingConstants.SETTING_RENDERER_CONFIG.VendettaCustomPage;
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
