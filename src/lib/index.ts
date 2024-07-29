import "../global.d.ts"; // eslint-disable-line import-alias/import-alias
import "../modules.d.ts"; // eslint-disable-line import-alias/import-alias

export * as api from "./api";
export * as debug from "./api/debug.js";
export * as settings from "./api/settings.js";
export * as fonts from "./fonts";
export * as plugins from "./plugins";
export * as themes from "./themes";
export * as ui from "./ui";
export * as utils from "./utils";
export * as metro from "@metro";

const _disposer = [] as Array<() => unknown>;

export function unload() {
    for (const d of _disposer) if (typeof d === "function") d();
    // @ts-expect-error
    delete window.bunny;
}

/**
 * For internal use only, do not use!
 * @internal
 */
unload.push = (fn: typeof _disposer[number]) => {
    _disposer.push(fn);
};
