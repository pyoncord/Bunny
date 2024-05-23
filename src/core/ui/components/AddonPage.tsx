import { Strings } from "@core/i18n";
import { CardWrapper } from "@core/ui/components/Card";
import { requireAssetIndex } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { settings } from "@lib/settings";
import { HTTP_REGEX_MULTI } from "@lib/utils/constants";
import { lazyDestructure } from "@lib/utils/lazy";
import { clipboard } from "@metro/common";
import { HelpMessage } from "@metro/common/components";
import { findByProps, findByPropsProxy } from "@metro/utils";
import { showInputAlert } from "@ui/alerts";
import { ErrorBoundary, Search } from "@ui/components";
import fuzzysort from "fuzzysort";
import { createContext } from "react";
import { FlatList, View } from "react-native";

export const RemoveModeContext = createContext(false);

interface AddonPageProps<T> {
    title: string;
    floatingButtonText: string;
    fetchFunction: (url: string) => Promise<void>;
    items: Record<string, T & ({ id: string; } | { name: string; })>;
    safeModeMessage: string;
    safeModeExtras?: JSX.Element | JSX.Element[];
    card: React.ComponentType<CardWrapper<T>>;
    isRemoveMode?: boolean;
    headerComponent?: JSX.Element;
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

const reanimated = findByPropsProxy("useSharedValue");
const { FloatingActionButton } = lazyDestructure(() => findByProps("FloatingActionButton"));

export default function AddonPage<T>({ floatingButtonText, fetchFunction, items, safeModeMessage, safeModeExtras, card: CardComponent, isRemoveMode, headerComponent, onFABPress }: AddonPageProps<T>) {
    useProxy(items);
    useProxy(settings);

    const collapseText = reanimated.useSharedValue(0);
    const yOffset = React.useRef<number>(0);
    const [search, setSearch] = React.useState("");

    return (
        <ErrorBoundary>
            {/* TODO: Implement better searching than just by ID */}
            <FlatList
                ListHeaderComponent={<>
                    {settings.safeMode?.enabled && <View style={{ marginBottom: 10 }}>
                        <HelpMessage messageType={0}>{safeModeMessage}</HelpMessage>
                        {safeModeExtras}
                    </View>}
                    <Search
                        style={{ marginBottom: 15 }}
                        onChangeText={(v: string) => setSearch(v.toLowerCase())}
                        placeholder={Strings.SEARCH}
                    />
                    {headerComponent}
                </>}
                onScroll={e => {
                    if (e.nativeEvent.contentOffset.y <= 0) return;
                    collapseText.value = Number(e.nativeEvent.contentOffset.y > yOffset.current);
                    yOffset.current = e.nativeEvent.contentOffset.y;
                }}
                style={{ paddingHorizontal: 10, paddingTop: 10 }}
                contentContainerStyle={{ paddingBottom: 90, paddingHorizontal: 5 }}
                data={getItemsByQuery(Object.values(items).filter(i => typeof i === "object"), search)}
                renderItem={({ item, index }) => <RemoveModeContext.Provider value={!!isRemoveMode}>
                    <CardComponent item={item} index={index} />
                </RemoveModeContext.Provider>}
            />
            <FloatingActionButton
                text={floatingButtonText}
                icon={requireAssetIndex("PlusLargeIcon")}
                state={{ collapseText }}
                onPress={onFABPress ?? (() => {
                    // from ./InstallButton.tsx
                    clipboard.getString().then(content =>
                        showInputAlert({
                            title: floatingButtonText,
                            initialValue: content.match(HTTP_REGEX_MULTI)?.[0] ?? "",
                            placeholder: Strings.URL_PLACEHOLDER,
                            onConfirm: (input: string) => fetchFunction(input),
                            confirmText: Strings.INSTALL,
                            cancelText: Strings.CANCEL,
                        })
                    );
                })}
            />
        </ErrorBoundary>
    );
}
