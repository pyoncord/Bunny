
export function initCorePlugins() {
    const unloads = [
        require("./quickInstall")
    ].map(p => {
        return p.default();
    });

    return () => unloads.forEach(m => typeof m === "function" && m());
}