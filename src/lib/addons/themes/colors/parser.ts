import { findByProps } from "@metro";
import chroma from "chroma-js";
import { omit } from "es-toolkit";
import { Platform, processColor } from "react-native";

import { colorsPref } from "./preferences";
import { ColorManifest, InternalColorDefinition } from "./types";

const tokenRef = findByProps("SemanticColor");

export function parseColorManifest(manifest: ColorManifest): InternalColorDefinition {
    const resolveType = (type = "dark") => (colorsPref.type ?? type) === "dark" ? "darker" : "light";

    if (manifest.spec === 3) {
        const semanticColorDefinitions: InternalColorDefinition["semantic"] = {};

        for (const [semanticColorKey, semanticColorValue] of Object.entries(manifest.semantic ?? {})) {
            if (typeof semanticColorValue === "object") {
                const { type, value, opacity: semanticColorOpacity } = semanticColorValue;

                if (type === "raw") {
                    semanticColorDefinitions[semanticColorKey] = {
                        value,
                        opacity: semanticColorOpacity ?? 1,
                    };
                } else {
                    const rawColorValue = tokenRef.RawColor[value];
                    semanticColorDefinitions[semanticColorKey] = {
                        value: rawColorValue,
                        opacity: semanticColorOpacity ?? 1,
                    };
                }
            } else if (typeof semanticColorValue === "string") {
                if (semanticColorValue.startsWith("#")) {
                    semanticColorDefinitions[semanticColorKey] = {
                        value: chroma.hex(semanticColorValue).hex(),
                        opacity: 1,
                    };
                } else {
                    semanticColorDefinitions[semanticColorKey] = {
                        value: tokenRef.RawColor[semanticColorValue],
                        opacity: 1,
                    };
                }
            } else {
                throw new Error(`Invalid semantic definitions: ${semanticColorValue}`);
            }
        }

        return {
            spec: 3,
            reference: resolveType(manifest.type),
            semantic: semanticColorDefinitions,
            raw: manifest.raw ?? {},
            background: manifest.background,
        };
    } else if (manifest.spec === 2) { // is Vendetta theme
        const semanticDefinitions: InternalColorDefinition["semantic"] = {};
        const background: InternalColorDefinition["background"] | undefined = manifest.background ? {
            ...omit(manifest.background, ["alpha"]),
            opacity: manifest.background.alpha
        } : undefined;

        if (manifest.semanticColors) {
            for (const key in manifest.semanticColors) {
                const values = manifest.semanticColors[key].map(c => c || undefined).slice(0, 2);
                if (!values[0]) continue;

                semanticDefinitions[key] = {
                    value: normalizeToHex(values[resolveType() === "light" ? 1 : 0])!,
                    opacity: 1
                };
            }
        }

        if (manifest.rawColors) {
            for (const key in manifest.rawColors) {
                const value = manifest.rawColors[key];
                if (!value) continue;
                manifest.rawColors[key] = normalizeToHex(value)!;
            }

            if (Platform.OS === "android") applyAndroidAlphaKeys(manifest.rawColors);
        }


        return {
            spec: 2,
            reference: resolveType(),
            semantic: semanticDefinitions,
            raw: manifest.rawColors ?? {},
            background
        };
    }

    throw new Error("Invalid theme spec");
}

export function applyAndroidAlphaKeys(rawColors?: Record<string, string>) {
    if (!rawColors) return;

    // these are native Discord Android keys
    const alphaMap: Record<string, [string, number]> = {
        "BLACK_ALPHA_60": ["BLACK", 0.6],
        "BRAND_NEW_360_ALPHA_20": ["BRAND_360", 0.2],
        "BRAND_NEW_360_ALPHA_25": ["BRAND_360", 0.25],
        "BRAND_NEW_500_ALPHA_20": ["BRAND_500", 0.2],
        "PRIMARY_DARK_500_ALPHA_20": ["PRIMARY_500", 0.2],
        "PRIMARY_DARK_700_ALPHA_60": ["PRIMARY_700", 0.6],
        "STATUS_GREEN_500_ALPHA_20": ["GREEN_500", 0.2],
        "STATUS_RED_500_ALPHA_20": ["RED_500", 0.2],
    };

    for (const key in alphaMap) {
        const [colorKey, alpha] = alphaMap[key];
        if (!rawColors[colorKey]) continue;
        rawColors[key] = chroma(rawColors[colorKey]).alpha(alpha).hex();
    }

    return rawColors;
}

export function normalizeToHex(colorString: string | undefined): string | undefined {
    if (colorString === undefined) return undefined;
    if (chroma.valid(colorString)) return chroma(colorString).hex();

    const color = Number(processColor(colorString));

    return chroma.rgb(
        color >> 16 & 0xff, // red
        color >> 8 & 0xff, // green
        color & 0xff, // blue
        color >> 24 & 0xff // alpha
    ).hex();
}

