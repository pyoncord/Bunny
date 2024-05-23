import { Strings } from "@core/i18n";
import { CardWrapper } from "@core/ui/components/AddonCard";
import { requireAssetIndex } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { settings } from "@lib/settings";
import { HTTP_REGEX_MULTI } from "@lib/utils/constants";
import { clipboard } from "@metro/common";
import { FloatingActionButton, HelpMessage } from "@metro/common/components";
import { showInputAlert } from "@ui/alerts";
import { ErrorBoundary, Search } from "@ui/components";
import fuzzysort from "fuzzysort";
import { createContext } from "react";
import { FlatList, View } from "react-native";

export const RemoveModeContext = createContext(false);

interface AddonPageProps<T> {
    title: string;
    fetchFunction: (url: string) => Promise<void>;
    items: Record<string, T & ({ id: string; } | { name: string; })>;
    safeModeMessage: string;
    safeModeExtras?: JSX.Element | JSX.Element[];
    card: React.ComponentType<CardWrapper<T>>;
    isRemoveMode?: boolean;
    onFABPress?: () => void;
}

function getItemsByQuery<T extends AddonPageProps<unknown>["items"][string]>(items: T[], query: string): T[] {
    if (!query) return items;

    return fuzzysort.go(query, items, {
        keys: [
            "id",
            "name",
            "manifest.name",
            "manifest.description",
            "manifest.authors.0.name",
            "manifest.authors.1.name"
        ]
    }).map(r => r.obj);
}

export default function AddonPage<T>({ card: CardComponent, ...props }: AddonPageProps<T>) {
    useProxy(props.items);
    useProxy(settings);

    const [search, setSearch] = React.useState("");

    return (
        <ErrorBoundary>
            {/* TODO: Implement better searching than just by ID */}
            <FlatList
                ListHeaderComponent={<View>
                    {settings.safeMode?.enabled && <View style={{ marginBottom: 10 }}>
                        <HelpMessage messageType={0}>{props.safeModeMessage}</HelpMessage>
                        {props.safeModeExtras}
                    </View>}
                    <Search
                        onChangeText={(v: string) => setSearch(v.toLowerCase())}
                        placeholder={Strings.SEARCH}
                    />
                </View>}
                style={{ paddingHorizontal: 10, paddingTop: 10 }}
                contentContainerStyle={{ paddingBottom: 90, paddingHorizontal: 5, gap: 12 }}
                data={getItemsByQuery(Object.values(props.items).filter(i => typeof i === "object"), search)}
                renderItem={({ item, index }) => <RemoveModeContext.Provider value={!!props.isRemoveMode}>
                    <CardComponent item={item} index={index} />
                </RemoveModeContext.Provider>}
            />
            <FloatingActionButton
                icon={requireAssetIndex("PlusLargeIcon")}
                onPress={props.onFABPress ?? (() => {
                    // from ./InstallButton.tsx
                    clipboard.getString().then(content =>
                        showInputAlert({
                            initialValue: content.match(HTTP_REGEX_MULTI)?.[0] ?? "",
                            placeholder: Strings.URL_PLACEHOLDER,
                            onConfirm: (input: string) => props.fetchFunction(input),
                            confirmText: Strings.INSTALL,
                            cancelText: Strings.CANCEL,
                        })
                    );
                })}
            />
        </ErrorBoundary>
    );
}
