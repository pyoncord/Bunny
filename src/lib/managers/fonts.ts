import { clearFolder, downloadFile, removeFile, writeFile } from "@lib/api/native/fs";
import { awaitSyncWrapper, createMMKVBackend, createStorage, wrapSync } from "@lib/api/storage";
import { safeFetch } from "@lib/utils";

type FontMap = Record<string, string>;

export interface FontDefinition {
    id: string;
    name: string;
    description: string;
    hash: string;
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

export async function fetchFont(id: string, selected = false) {
    let fontDefJson: FontDefinition;

    try {
        fontDefJson = await (await safeFetch(id, { cache: "no-store" })).json();
    } catch (e) {
        throw new Error(`Failed to fetch theme at ${id}`, { cause: e });
    }

    try {
        await Promise.all(Object.entries(fontDefJson.main).map(async ([font, url]) => {
            let ext = url.split(".").pop();
            if (ext !== "ttf" && ext !== "otf") ext = "ttf";
            await downloadFile(url, `downloads/fonts/${fontDefJson.name}/${font}.${ext}`);
        }));
    } catch (e) {
        throw new Error("Failed to download font assets", { cause: e });
    }

    fonts[id] = {
        // @ts-expect-error
        id,
        ...fontDefJson
    };

    // TODO: Should we prompt when the selected font is updated?
    if (selected) writeFont(fonts[id]);
}

export async function installFont(id: string, selected = true) {
    if (typeof id !== "string" || id in fonts) {
        throw new Error("Invalid id or font was already installed");
    }

    await fetchFont(id);
    if (selected) await selectFont(id);
}

export async function selectFont(id: string | null) {
    if (id) fonts.__selected = id;
    else delete fonts.__selected;
    await writeFont(id == null ? null : fonts[id]);
}

export async function removeFont(id: string) {
    const selected = fonts.__selected === id;
    if (selected) await selectFont(null);
    await clearFolder(`downloads/fonts/${fonts[id].name}`);
    delete fonts[id];
}

export async function updateFonts() {
    await awaitSyncWrapper(fonts);
    await Promise.allSettled(
        Object.keys(fonts).map(
            id => fetchFont(id, fonts.__selected === id)
        )
    );
}
