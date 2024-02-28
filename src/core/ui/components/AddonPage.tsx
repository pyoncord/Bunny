import { NavigationNative, ReactNative as RN, clipboard } from "@metro/common";
import { useProxy } from "@/lib/api/storage";
import { HelpMessage, ErrorBoundary, Search } from "@ui/components";
import { CardWrapper } from "@/core/ui/components/Card";
import { settings } from "@lib/settings";
import { findByProps } from "@/lib/metro/filters";
import { HTTP_REGEX_MULTI } from "@/lib/utils/constants";
import { showInputAlert } from "@ui/alerts";
import { getAssetIDByName } from "@/lib/api/assets";
import { Strings, formatString } from "@/core/i18n";
import fuzzysort from "fuzzysort";

interface AddonPageProps<T> {
    title: string;
    fetchFunction: (url: string) => Promise<void>;
    items: Record<string, T & { id: string }>;
    safeModeMessage: string;
    safeModeExtras?: JSX.Element | JSX.Element[];
    card: React.ComponentType<CardWrapper<T>>;
}

function getItemsByQuery<T extends { id?: string }>(items: T[], query: string): T[] {
    if (!query) return items;

    return fuzzysort.go(query, items, { keys: [
        "id",
        "manifest.name",
        "manifest.description",
        "manifest.authors.0.name", 
        "manifest.authors.1.name"
    ]}).map(r => r.obj);
}

const reanimated = findByProps("useSharedValue");
const { FloatingActionButton } = findByProps("FloatingActionButton");

export default function AddonPage<T>({ title, fetchFunction, items, safeModeMessage, safeModeExtras, card: CardComponent }: AddonPageProps<T>) {
    useProxy(settings);
    useProxy(items);

    const collapseText = reanimated.useSharedValue(0);
    const yOffset = React.useRef<number>(0);
    const [search, setSearch] = React.useState("");

    return (
        <ErrorBoundary>
            {/* TODO: Implement better searching than just by ID */}
            <RN.FlatList
                ListHeaderComponent={<>
                    {settings.safeMode?.enabled && <RN.View style={{ marginBottom: 10 }}>
                        <HelpMessage messageType={0}>{safeModeMessage}</HelpMessage>
                        {safeModeExtras}
                    </RN.View>}
                    <Search
                        style={{ marginBottom: 15 }}
                        onChangeText={(v: string) => setSearch(v.toLowerCase())}
                        placeholder={Strings.SEARCH}
                    />
                </>}
                onScroll={e => {
                    if (e.nativeEvent.contentOffset.y <= 0) return;
                    collapseText.value = Number(e.nativeEvent.contentOffset.y > yOffset.current);
                    yOffset.current = e.nativeEvent.contentOffset.y;
                }}
                onMomentumScrollEnd={() => collapseText.value = 0}
                style={{ paddingHorizontal: 10, paddingTop: 10 }}
                contentContainerStyle={{ paddingBottom: 70 }}
                data={getItemsByQuery(Object.values(items), search)}
                renderItem={({ item, index }) => <CardComponent item={item} index={index} />}
            />
            <FloatingActionButton 
                text={formatString("INSTALL_TITLE", { title })}
                icon={getAssetIDByName("DownloadIcon")}
                state={{ collapseText }}
                onPress={() => {
                    // from ./InstallButton.tsx
                    clipboard.getString().then((content) =>
                        showInputAlert({
                            title: formatString("INSTALL_TITLE", { title }),
                            initialValue: content.match(HTTP_REGEX_MULTI)?.[0] ?? "",
                            placeholder: "https://example.com/",
                            onConfirm: (input: string) => fetchFunction(input),
                            confirmText: Strings.INSTALL,
                            cancelText: Strings.CANCEL,
                        })
                    )
                }} 
            />
        </ErrorBoundary>
    )
}