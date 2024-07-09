import { allSettled } from "@core/polyfills/allSettled";
import { createVdPluginObject } from "@core/polyfills/vendettaObject";
import { awaitStorage, createMMKVBackend, createStorage, purgeStorage, wrapSync } from "@lib/api/storage";
import { settings } from "@lib/settings";
import { safeFetch } from "@lib/utils";
import { BUNNY_PROXY_PREFIX, OLD_BUNNY_PROXY_PREFIX, VD_PROXY_PREFIX } from "@lib/utils/constants";
import invariant from "@lib/utils/invariant";
import { logger } from "@lib/utils/logger";
import { Author } from "@lib/utils/types";
import { isNotNil, uniqWith } from "es-toolkit";

type EvaledPlugin = {
    onLoad?(): void;
    onUnload(): void;
    settings: () => JSX.Element;
};

interface PluginManifest {
    id: string;
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
    id: string;
    source: string;
    manifest: PluginManifest;
    enabled: boolean;
    update: boolean;
    /**
     * Message of plugin startup error. Gone after plugin boots successfully
     * */
    error?: string;

    // TODO: Use fs to avoid unnecessary memory usage
    js: string;
}

const arePluginsEnabled = () => !settings.safeMode?.enabled;

const _pluginInstances: Record<string, EvaledPlugin> = {};

export const sourceStore = wrapSync(createStorage<{ [id in string]?: BunnyPlugin }>(createMMKVBackend("PLUGIN_SOURCES_STORE")));
export const preferredSourceStore = wrapSync(createStorage<{ [id in string]?: string }>(createMMKVBackend("PREFERRED_PLUGIN_SOURCE")));

export function getPluginById(id: string) {
    if (!id) return undefined;

    if (!preferredSourceStore[id]) {
        for (const plugin of Object.values(sourceStore)) {
            if (plugin?.id === id) {
                return plugin;
            }
        }
    }

    return sourceStore[preferredSourceStore[id]!];
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

    for (const f of ["id", "main", "hash", "bunny"] as const)
        invariant(pluginManifest[f], `Plugin manifest does not contain mandatory field: '${f}'`);

    let pluginJs: string | undefined;

    if (existingPlugin?.manifest.hash !== pluginManifest.hash) {
        try {
            pluginJs = await (await fetch(source + pluginManifest.main)).text();
        } catch { } // Empty catch, checked below
    }

    invariant(pluginJs || existingPlugin, `Failed to fetch JS from ${source}`);

    return sourceStore[source] = {
        id: pluginManifest.id,
        source: source,
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
    if (enabled) await startPlugin(plugin.id);
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
        if (arePluginsEnabled()) {
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

    if (arePluginsEnabled()) {
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
    await awaitStorage(sourceStore, preferredSourceStore, settings);

    if (arePluginsEnabled()) {
        const plugins = uniqWith(
            Object.values(sourceStore)
                .map(s => getPluginById(s!.id))
                .filter(isNotNil),
            (a, b) => a?.id === b?.id
        );

        const updatePromise: Promise<unknown>[] = [];
        const updateAndStart = async (plugin: BunnyPlugin) => {
            if (plugin.update) {
                try {
                    await fetchAndStorePlugin(plugin.id);
                } catch (e) {
                    logger.error(e);
                }
            }

            await startPlugin(plugin.id);
        };

        for (const plugin of plugins) {
            if (plugin.enabled) {
                updatePromise.push(updateAndStart(plugin));
            } else if (plugin.update) {
                fetchAndStorePlugin(plugin.id);
            }
        }

        await allSettled(updatePromise);
    }

    return () => Object.keys(_pluginInstances).forEach(p => stopPlugin(p, false));
}

export function getSettingsComponent(id: string) {
    return _pluginInstances[id]?.settings;
}
