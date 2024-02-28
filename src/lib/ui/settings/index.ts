import patchPanels from "@ui/settings/patches/panels";
import patchYou from "@ui/settings/patches/you";

export default function initSettings() {
    const patches = [
        patchPanels(),
        patchYou(),
    ]

    return () => patches.forEach(p => p?.());
}
