import type { Metro } from "@metro/types";

export const modules: Metro.ModuleList = window.modules;

export const metroRequire: Metro.Require = window.__r;

export const define: Metro.DefineFn = window.__d;

export const clear: Metro.ClearFn = window.__c;

export const registerSegment: Metro.RegisterSegmentFn = window.__registerSegment;
