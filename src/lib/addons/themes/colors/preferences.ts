import { createStorage } from "@lib/api/storage";

interface BunnyColorPreferencesStorage {
    selected: string | null;
    type?: "dark" | "light" | null;
    customBackground: "hidden" | null;
    per?: Record<string, { autoUpdate?: string; } | undefined>;
}

export const colorsPref = createStorage<BunnyColorPreferencesStorage>(
    "themes/colors/preferences.json",
    {
        dflt: {
            selected: null,
            customBackground: null
        }
    }
);
