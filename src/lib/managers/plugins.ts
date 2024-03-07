import { allSettled } from "@core/polyfills";
import { awaitSyncWrapper, createMMKVBackend, createStorage, purgeStorage, wrapSync } from "@lib/api/storage";
import { settings } from "@lib/settings";
import { safeFetch } from "@lib/utils";
import { logger, logModule } from "@lib/utils/logger";
import { Author } from "@lib/utils/types";

type EvaledPlugin = {
    onLoad?(): void;
    onUnload(): void;
    settings: JSX.Element;
};

// See https://github.com/vendetta-mod/polymanifest
export interface PluginManifest {
    name: string;
    description: string;
    authors: Author[];
    main: string;
    hash: string;
    // Vendor-specific field, contains our own data
    vendetta?: {
        icon?: string;
    };
}

export interface BunnyPlugin {
    id: string;
    manifest: PluginManifest;
    enabled: boolean;
    update: boolean;
    js: string;
}

export const plugins = wrapSync(createStorage<Record<string, BunnyPlugin>>(createMMKVBackend("VENDETTA_PLUGINS")));
const loadedPlugins: Record<string, EvaledPlugin> = {};

export async function fetchPlugin(id: string) {
    if (!id.endsWith("/")) id += "/";
    const existingPlugin = plugins[id];

    let pluginManifest: PluginManifest;

    try {
        pluginManifest = await (await safeFetch(id + "manifest.json", { cache: "no-store" })).json();
    } catch {
        throw new Error(`Failed to fetch manifest for ${id}`);
    }

    let pluginJs: string | undefined;

    if (existingPlugin?.manifest.hash !== pluginManifest.hash) {
        try {
            // by polymanifest spec, plugins should always specify their main file, but just in case
            pluginJs = await (await safeFetch(id + (pluginManifest.main || "index.js"), { cache: "no-store" })).text();
        } catch { } // Empty catch, checked below
    }

    if (!pluginJs && !existingPlugin) throw new Error(`Failed to fetch JS for ${id}`);

    plugins[id] = {
        id: id,
        manifest: pluginManifest,
        enabled: existingPlugin?.enabled ?? false,
        update: existingPlugin?.update ?? true,
        js: pluginJs ?? existingPlugin.js,
    };
}

export async function installPlugin(id: string, enabled = true) {
    if (!id.endsWith("/")) id += "/";
    if (typeof id !== "string" || id in plugins) throw new Error("Plugin already installed");
    await fetchPlugin(id);
    if (enabled) await startPlugin(id);
}

export async function _evalPlugin(plugin: BunnyPlugin) {
    const vendettaForPlugins = {
        ...window.vendetta,
        plugin: {
            id: plugin.id,
            manifest: plugin.manifest,
            // Wrapping this with wrapSync is NOT an option.
            storage: await createStorage<Record<string, any>>(createMMKVBackend(plugin.id)),
        },
        logger: new logModule(`Bunny » ${plugin.manifest.name}`),
    };
    const pluginString = `vendetta=>{return ${plugin.js}}\n//# sourceURL=${plugin.id}`;

    const raw = (0, eval)(pluginString)(vendettaForPlugins);
    const ret = typeof raw === "function" ? raw() : raw;
    return ret?.default ?? ret ?? {};
}

export async function startPlugin(id: string) {
    if (!id.endsWith("/")) id += "/";
    const plugin = plugins[id];
    if (!plugin) throw new Error("Attempted to start non-existent plugin");

    try {
        if (!settings.safeMode?.enabled) {
            const pluginRet: EvaledPlugin = await _evalPlugin(plugin);
            loadedPlugins[id] = pluginRet;
            pluginRet.onLoad?.();
        }
        plugin.enabled = true;
    } catch (e) {
        logger.error(`Plugin ${plugin.id} errored whilst loading, and will be unloaded`, e);

        try {
            loadedPlugins[plugin.id]?.onUnload?.();
        } catch (e2) {
            logger.error(`Plugin ${plugin.id} errored whilst unloading`, e2);
        }

        delete loadedPlugins[id];
        plugin.enabled = false;
    }
}

export function stopPlugin(id: string, disable = true) {
    if (!id.endsWith("/")) id += "/";
    const plugin = plugins[id];
    const pluginRet = loadedPlugins[id];
    if (!plugin) throw new Error("Attempted to stop non-existent plugin");

    if (!settings.safeMode?.enabled) {
        try {
            pluginRet?.onUnload?.();
        } catch (e) {
            logger.error(`Plugin ${plugin.id} errored whilst unloading`, e);
        }

        delete loadedPlugins[id];
    }

    disable && (plugin.enabled = false);
}

export async function removePlugin(id: string) {
    if (!id.endsWith("/")) id += "/";
    const plugin = plugins[id];
    if (plugin.enabled) stopPlugin(id);
    delete plugins[id];
    await purgeStorage(id);
}

export async function _initPlugins() {
    await awaitSyncWrapper(settings);
    await awaitSyncWrapper(plugins);
    const allIds = Object.keys(plugins);

    if (!settings.safeMode?.enabled) {
        // Loop over any plugin that is enabled, update it if allowed, then start it.
        await allSettled(allIds.filter(pl => plugins[pl].enabled).map(async pl => (plugins[pl].update && await fetchPlugin(pl).catch((e: Error) => logger.error(e.message)), await startPlugin(pl))));
        // Wait for the above to finish, then update all disabled plugins that are allowed to.
        allIds.filter(pl => !plugins[pl].enabled && plugins[pl].update).forEach(pl => fetchPlugin(pl));
    }

    return stopAllPlugins;
}

const stopAllPlugins = () => Object.keys(loadedPlugins).forEach(p => stopPlugin(p, false));

export const getSettings = (id: string) => loadedPlugins[id]?.settings;
