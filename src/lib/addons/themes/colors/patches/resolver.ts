import { _colorRef } from "@lib/addons/themes/colors/updater";
import { ThemeManager } from "@lib/api/native/modules";
import { before, instead } from "@lib/api/patcher";
import { findByProps } from "@metro";
import { byMutableProp } from "@metro/filters";
import { createLazyModule } from "@metro/lazy";
import chroma from "chroma-js";

const tokenReference = findByProps("SemanticColor");
const isThemeModule = createLazyModule(byMutableProp("isThemeDark"));

export default function patchDefinitionAndResolver() {
    const callback = ([theme]: any[]) => theme === _colorRef.key ? [_colorRef.current!.reference] : void 0;

    Object.keys(tokenReference.RawColor).forEach(key => {
        Object.defineProperty(tokenReference.RawColor, key, {
            configurable: true,
            enumerable: true,
            get: () => {
                const ret = _colorRef.current?.raw[key];
                return ret || _colorRef.origRaw[key];
            }
        });
    });

    const unpatches = [
        before("isThemeDark", isThemeModule, callback),
        before("isThemeLight", isThemeModule, callback),
        before("updateTheme", ThemeManager, callback),
        instead("resolveSemanticColor", tokenReference.default.meta ?? tokenReference.default.internal, (args: any[], orig: any) => {
            if (!_colorRef.current) return orig(...args);
            if (args[0] !== _colorRef.key) return orig(...args);

            args[0] = _colorRef.current.reference;

            const [name, colorDef] = extractInfo(_colorRef.current!.reference, args[1]);

            const semanticDef = _colorRef.current.semantic[name];
            if (semanticDef?.value) {
                return chroma(semanticDef.value).alpha(semanticDef.opacity).hex();
            }

            const rawValue = _colorRef.current.raw[colorDef.raw];
            if (rawValue) {
                // Set opacity if needed
                return colorDef.opacity === 1 ? rawValue : chroma(rawValue).alpha(colorDef.opacity).hex();
            }

            // Fallback to default
            return orig(...args);
        }),
        () => {
            // Not the actual module but.. yeah.
            Object.defineProperty(tokenReference, "RawColor", {
                configurable: true,
                writable: true,
                value: _colorRef.origRaw
            });
        }
    ];

    return () => unpatches.forEach(p => p());
}

function extractInfo(themeName: string, colorObj: any): [name: string, colorDef: any] {
    // @ts-ignore - assigning to extractInfo._sym
    const propName = colorObj[extractInfo._sym ??= Object.getOwnPropertySymbols(colorObj)[0]];
    const colorDef = tokenReference.SemanticColor[propName];

    return [propName, colorDef[themeName]];
}
