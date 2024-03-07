// Good luck reading this!
import type { ImageURISource } from "react-native";

import { patchPanelUI } from "./patches/panel";
import { patchTabsUI } from "./patches/tabs";

export interface RowConfig {
    key: string;
    title: () => string;
    onPress?: () => any;
    render?: Parameters<typeof React.lazy>[0];
    icon?: ImageURISource | number;
    usePredicate?: () => boolean,
    rawTabsConfig?: Record<string, any>;
}

export const registeredSections = {} as {
    [key: string]: RowConfig[];
};

export function registerSection(section: { name: string; items: RowConfig[]; }) {
    registeredSections[section.name] = section.items;
    return () => delete registeredSections[section.name];
}

export function _patchSettings() {
    const unpatches = new Array<() => boolean>;

    patchPanelUI(unpatches);
    patchTabsUI(unpatches);

    return () => unpatches.forEach(u => u());
}
