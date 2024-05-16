import { clearFolder, downloadFile, removeFile, writeFile } from "@lib/api/native/fs";
import { awaitSyncWrapper, createMMKVBackend, createStorage, wrapSync } from "@lib/api/storage";
import { safeFetch } from "@lib/utils";

type FontMap = Record<string, string>;

export interface FontDefinition {
    name: string;
    description?: string;
    spec: 1;
    main: FontMap;
}

type FontStorage = Record<string, FontDefinition> & { __selected?: string; };
export const fonts = wrapSync(createStorage<FontStorage>(createMMKVBackend("BUNNY_FONTS")));

async function writeFont(font: FontDefinition | null) {
    if (!font && font !== null) throw new Error("Arg font must be a valid object or null");
    if (font) {
        await writeFile("fonts.json", JSON.stringify(font));
    } else {
        await removeFile("fonts.json");
    }
}

export async function validateFont(font: FontDefinition) {
    if (!font || typeof font !== "object") throw new Error("URL returned a nul/non-object JSON");
    if (typeof font.spec !== "number") throw new Error("Invalid font 'spec' number");
    if (font.spec !== 1) throw new Error("Only fonts which follows spec:1 are supported");

    const requiredFields = ["name", "main"] as const;

    if (requiredFields.some(f => !font[f])) throw new Error(`Font is missing one of the fields: ${requiredFields}`);
    if (font.name.startsWith("__")) throw new Error("Font names cannot start with __");
    if (font.name in fonts) throw new Error(`There is already a font named ${font.name} installed`);
}

export async function fetchFont(url: string, selected = false) {
    let fontDefJson: FontDefinition;

    try {
        fontDefJson = await (await safeFetch(url, { cache: "no-store" })).json();
    } catch (e) {
        throw new Error(`Failed to fetch theme at ${url}`, { cause: e });
    }

    validateFont(fontDefJson);

    try {
        await Promise.all(Object.entries(fontDefJson.main).map(async ([font, url]) => {
            let ext = url.split(".").pop();
            if (ext !== "ttf" && ext !== "otf") ext = "ttf";
            await downloadFile(url, `downloads/fonts/${fontDefJson.name}/${font}.${ext}`);
        }));
    } catch (e) {
        throw new Error("Failed to download font assets", { cause: e });
    }

    fonts[fontDefJson.name] = fontDefJson;

    // TODO: Should we prompt when the selected font is updated?
    if (selected) writeFont(fonts[fontDefJson.name]);
}

export async function installFont(name: string, selected = true) {
    if (typeof name !== "string" || name in fonts) {
        throw new Error("Invalid id or font was already installed");
    }

    await fetchFont(name);
    if (selected) await selectFont(name);
}

export async function selectFont(name: string | null) {
    if (name) fonts.__selected = name;
    else delete fonts.__selected;
    await writeFont(name == null ? null : fonts[name]);
}

export async function removeFont(name: string) {
    const selected = fonts.__selected === name;
    if (selected) await selectFont(null);
    delete fonts[name];
    try {
        await clearFolder(`downloads/fonts/${name}`);
    } catch {
        // ignore
    }
}

export async function updateFonts() {
    await awaitSyncWrapper(fonts);
    await Promise.allSettled(
        Object.keys(fonts).map(
            name => fetchFont(name, fonts.__selected === name)
        )
    );
}
