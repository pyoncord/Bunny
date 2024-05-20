// eslint-disable-next-line import-alias/import-alias
import "../global.d.ts";

export * as api from "./api";
export * as debug from "./debug";
export * as managers from "./managers";
// export * as metro from "./metro";
export * as settings from "./settings";
export * as ui from "./ui";
export * as utils from "./utils";

const _disposer = new Array<() => unknown>;

export function unload() {
    for (const d of _disposer) if (typeof d === "function") d();
    delete window.bunny;
}

/**
 * For internal use only, do not use!
 * @internal
 */
unload.push = (fn: typeof _disposer[number]) => {
    _disposer.push(fn);
};
