// TODO: make settings patches part of the api
import patchPanels from "@core/ui/settings/patches/panels";
import patchYou from "@core/ui/settings/patches/you";

export default function initSettings() {
    const patches = [
        patchPanels(),
        patchYou(),
    ];

    return () => patches.forEach(p => p?.());
}
