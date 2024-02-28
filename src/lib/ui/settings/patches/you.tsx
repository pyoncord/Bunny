import { findByProps } from "@metro/filters";
import { after, before } from "@lib/api/patcher";
import { getRenderableScreens, getScreens, getYouData } from "@ui/settings/data";
import { i18n } from "@lib/metro/common";
import { Strings } from "@/core/i18n";

export default function patchYou() {
    const patches = new Array<Function>;

    newYouPatch(patches) || oldYouPatch(patches);
    return () => patches.forEach(p => p?.());
}

function oldYouPatch(patches: Function[]) {
    const layoutModule = findByProps("useOverviewSettings");
    const titleConfigModule = findByProps("getSettingTitleConfig");
    const miscModule = findByProps("SETTING_RELATIONSHIPS", "SETTING_RENDERER_CONFIGS");

    // Checks for 189.4 and above
    // When dropping support for 189.3 and below, following can be done: (unless Discord changes things again)
    // const gettersModule = findByProps("getSettingListItems");
    const OLD_GETTER_FUNCTION = "getSettingSearchListItems";
    const NEW_GETTER_FUNCTION = "getSettingListItems";
    const oldGettersModule = findByProps(OLD_GETTER_FUNCTION);
    const usingNewGettersModule = !oldGettersModule;
    const getterFunctionName = usingNewGettersModule ? NEW_GETTER_FUNCTION : OLD_GETTER_FUNCTION;
    const gettersModule = oldGettersModule ?? findByProps(NEW_GETTER_FUNCTION);

    if (!gettersModule || !layoutModule) return;

    const screens = getScreens(true);
    const renderableScreens = getRenderableScreens(true);
    const data = getYouData();

    patches.push(after("useOverviewSettings", layoutModule, (_, ret) => manipulateSections(ret, data.getLayout())));

    patches.push(after("getSettingTitleConfig", titleConfigModule, (_, ret) => ({
        ...ret,
        ...data.titleConfig,
    })));

    patches.push(after(getterFunctionName, gettersModule, ([settings], ret) => [
        ...(renderableScreens.filter(s => settings.includes(s.key))).map(s => ({
            type: "setting_search_result",
            ancestorRendererData: data.rendererConfigs[s.key],
            setting: s.key,
            title: data.titleConfig[s.key],
            breadcrumbs: [Strings.BUNNY],
            icon: data.rendererConfigs[s.key].icon,
        })),
        // .filter can be removed when dropping support for 189.3 and below (unless Discord changes things again)
        ...ret.filter((i: any) => (usingNewGettersModule || !screens.map(s => s.key).includes(i.setting)))
    ].map((item, index, parent) => ({ ...item, index, total: parent.length }))));

    const oldRelationships = miscModule.SETTING_RELATIONSHIPS;
    const oldRendererConfigs = miscModule.SETTING_RENDERER_CONFIGS;
    
    miscModule.SETTING_RELATIONSHIPS = { ...oldRelationships, ...data.relationships };
    miscModule.SETTING_RENDERER_CONFIGS = { ...oldRendererConfigs, ...data.rendererConfigs };

    patches.push(() => {
        miscModule.SETTING_RELATIONSHIPS = oldRelationships;
        miscModule.SETTING_RENDERER_CONFIGS = oldRendererConfigs;
    });

    return true;
}

function newYouPatch(patches: Function[]) {
    const settingsListComponents = findByProps("SearchableSettingsList");
    const settingConstantsModule = findByProps("SETTING_RENDERER_CONFIG");
    const gettersModule = findByProps("getSettingListItems");

    if (!gettersModule || !settingsListComponents || !settingConstantsModule) return false;

    const screens = getScreens(true);
    const data = getYouData();

    patches.push(before("type", settingsListComponents.SearchableSettingsList, ([{ sections }]) => manipulateSections(sections, data.getLayout())));

    patches.push(after("getSettingListSearchResultItems", gettersModule, (_, ret) => {
        ret.forEach((s: any) => screens.some(b => b.key === s.setting) && (s.breadcrumbs = [Strings.BUNNY]))
    }));

    const oldRendererConfig = settingConstantsModule.SETTING_RENDERER_CONFIG;
    settingConstantsModule.SETTING_RENDERER_CONFIG = { ...oldRendererConfig, ...data.rendererConfigs };

    patches.push(() => {
        settingConstantsModule.SETTING_RENDERER_CONFIG = oldRendererConfig;
    });

    return true;
}

const isLabel = (i: any, name: string) => i?.label === name || i?.title === name;

function manipulateSections(sections: any[], layout: any) {
    if (!Array.isArray(sections) || sections.find((i: any) => isLabel(i, Strings.BUNNY))) return;

    // Add our settings
    const accountSettingsIndex = sections.findIndex((i: any) => isLabel(i, i18n.Messages.ACCOUNT_SETTINGS));
    sections.splice(accountSettingsIndex + 1, 0, layout);

    // Upload Logs button be gone
    const supportCategory = sections.find((i: any) => isLabel(i, i18n.Messages.SUPPORT));
    if (supportCategory) supportCategory.settings = supportCategory.settings.filter((s: string) => s !== "UPLOAD_DEBUG_LOGS")
}