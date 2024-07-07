import { createVdPluginObject } from "@core/polyfills/vendettaObject";
import { awaitStorage, createMMKVBackend, createStorage, purgeStorage, wrapSync } from "@lib/api/storage";
import { settings } from "@lib/settings";
import { safeFetch } from "@lib/utils";
import { BUNNY_PROXY_PREFIX, OLD_BUNNY_PROXY_PREFIX, VD_PROXY_PREFIX } from "@lib/utils/constants";
import invariant from "@lib/utils/invariant";
import { proxyLazy } from "@lib/utils/lazy";
import { logger } from "@lib/utils/logger";
import { Author } from "@lib/utils/types";

type EvaledPlugin = {
    onLoad?(): void;
    onUnload(): void;
    settings: () => JSX.Element;
};

interface PluginManifest {
    name: string;
    description: string;
    authors: Author[];
    main: string;
    hash: string;
    // Vendor-specific field, contains our own data
    vendetta?: {
        icon?: string;
    };
    bunny?: {};
}

export interface BunnyPlugin {
    source: string;
    pluginId: string;
    manifest: PluginManifest;
    enabled: boolean;
    update: boolean;
    /**
     * Message of plugin startup error. Gone after plugin boots successfully
     * */
    error?: string;

    // TODO: Use fs to avoid unnecessary memory usage
    js: string;

    /**
     * @deprecated use `source` (for URL) or `pluginId` (plugin's unique ID)
     * */
    id: string;
}

const pluginsEnabled = () => !settings.safeMode?.enabled;

const _pluginInstances: Record<string, EvaledPlugin> = {};

export const selectedSources = wrapSync(createStorage<Record<string, string | undefined>>(createMMKVBackend("SELECTED_PLUGIN_SOURCES")));
export const sourceStore = proxyLazy(() => {
    type StorageInterface = Record<string, BunnyPlugin | undefined>;
    const storagePromise = createStorage<StorageInterface>(createMMKVBackend("VENDETTA_PLUGINS"));

    storagePromise.then(st => {
        for (const plugin of Object.values(st)) if (plugin) {
            plugin.pluginId ??= `${plugin.manifest.name}-${plugin.manifest.authors?.[0]?.name}`.toLowerCase();
            plugin.source ??= plugin.id;
        }
    });

    return wrapSync(storagePromise);
});

export function getPluginById(id: string) {
    if (!selectedSources[id]) {
        for (const plugin of Object.values(sourceStore)) {
            if (plugin?.pluginId === id) {
                selectedSources[id] = plugin.source;
                break;
            }
        }
    }

    return selectedSources[id] ? sourceStore[selectedSources[id]!] : undefined;
}

export async function fetchAndStorePlugin(source: string) {
    if (!source.endsWith("/")) source += "/";
    const existingPlugin = sourceStore[source];

    const fetch = (url: string) => safeFetch(
        url
            .replace(VD_PROXY_PREFIX, BUNNY_PROXY_PREFIX)
            .replace(OLD_BUNNY_PROXY_PREFIX, BUNNY_PROXY_PREFIX),
        { cache: "no-store" }
    );

    let pluginManifest: PluginManifest;

    try {
        pluginManifest = await (await fetch(source + "manifest.json")).json();
    } catch {
        throw new Error(`Failed to fetch manifest for ${source}`);
    }

    let pluginJs: string | undefined;

    if (existingPlugin?.manifest.hash !== pluginManifest.hash) {
        try {
            // by polymanifest spec, plugins should always specify their main file, but just in case
            pluginJs = await (await fetch(source + (pluginManifest.main || "index.js"))).text();
        } catch { } // Empty catch, checked below
    }

    invariant(pluginJs || existingPlugin, `Failed to fetch JS from ${source}`);

    return sourceStore[source] = {
        id: source,
        source: source,
        pluginId: pluginManifest.name,
        manifest: pluginManifest,
        enabled: existingPlugin?.enabled ?? false,
        update: existingPlugin?.update ?? true,
        js: pluginJs ?? existingPlugin!.js,
        error: existingPlugin?.error
    };
}

export async function installPlugin(source: string, enabled = true) {
    if (!source.endsWith("/")) source += "/";
    invariant(!(source in sourceStore), "Source was already installed");

    const plugin = await fetchAndStorePlugin(source);
    if (enabled) await startPlugin(plugin.pluginId);
}

/**
 * @internal
 */
async function evalPlugin(plugin: BunnyPlugin) {
    const vdObject = await createVdPluginObject(plugin);
    const pluginString = `vendetta=>{return ${plugin.js}}\n//# sourceURL=${plugin.source}?hash=${plugin.manifest.hash}`;

    const raw = (0, eval)(pluginString)(vdObject);
    const ret = typeof raw === "function" ? raw() : raw;
    return ret?.default ?? ret ?? {};
}

export async function startPlugin(id: string) {
    const plugin = getPluginById(id);
    invariant(plugin, "Attempted to start non-existent plugin");

    try {
        if (pluginsEnabled()) {
            const pluginRet: EvaledPlugin = await evalPlugin(plugin);
            _pluginInstances[id] = pluginRet;
            pluginRet.onLoad?.();
        }

        delete plugin.error;
        plugin.enabled = true;
    } catch (e) {
        logger.error(`Plugin ${plugin.source} errored whilst loading, and will be unloaded`, e);
        plugin.error = e instanceof Error ? e.stack : String(e);

        try {
            _pluginInstances[id]?.onUnload?.();
        } catch (e2) {
            logger.error(`Plugin ${plugin.source} errored whilst unloading`, e2);
        }

        delete _pluginInstances[id];
        plugin.enabled = false;
    }
}

export function stopPlugin(id: string, disable = true) {
    const plugin = getPluginById(id);
    const pluginInstance = _pluginInstances[id];
    invariant(plugin, "Attempted to stop non-existent plugin");

    if (pluginsEnabled()) {
        try {
            pluginInstance?.onUnload?.();
        } catch (e) {
            logger.error(`Plugin ${plugin.source} errored whilst unloading`, e);
        }

        delete _pluginInstances[id];
    }

    if (disable) plugin.enabled = false;
}

export async function removePlugin(id: string) {
    const plugin = getPluginById(id);
    invariant(plugin, "Removing non-existent plugin");
    if (plugin.enabled) stopPlugin(id);
    delete sourceStore[plugin.source];
    await purgeStorage(plugin.source);
}

/**
 * @internal
 */
export async function initPlugins() {
    await awaitStorage(sourceStore, selectedSources, settings);

    // TODO: Optimize this
    if (pluginsEnabled()) {
        const allIds = [...new Set(Object.values(sourceStore).map(s => s!.pluginId))];

        // Loop over enabled plugins, update and start them
        const enabledPlugins = allIds.filter(id => getPluginById(id)?.enabled);
        await Promise.all(enabledPlugins.map(async pl => {
            if (getPluginById(pl)!.update) {
                try {
                    await fetchAndStorePlugin(pl);
                } catch (e) {
                    logger.error(e);
                }
            }

            await startPlugin(pl);
        }));

        // Loop over disabled plugins that are allowed to update
        allIds
            .filter(id => !getPluginById(id)?.enabled && getPluginById(id)!.update)
            .forEach(id => fetchAndStorePlugin(id));
    }

    return () => Object.keys(_pluginInstances).forEach(p => stopPlugin(p, false));
}

export function getSettingsComponent(id: string) {
    return _pluginInstances[id]?.settings;
}
