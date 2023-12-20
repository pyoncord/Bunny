import { NavigationNative, ReactNative as RN, clipboard } from "@metro/common";
import { useProxy } from "@lib/storage";
import { HelpMessage, ErrorBoundary, Search } from "@ui/components";
import { CardWrapper } from "@ui/settings/components/Card";
import settings from "@lib/settings";
import { findByProps } from "@/lib/metro/filters";
import { showToast } from "@/ui/toasts";
import { HTTP_REGEX_MULTI } from "@/lib/constants";
import { showInputAlert } from "@/ui/alerts";
import { getAssetIDByName } from "@/ui/assets";

interface AddonPageProps<T> {
    title: string;
    fetchFunction: (url: string) => Promise<void>;
    items: Record<string, T & { id: string }>;
    safeModeMessage: string;
    safeModeExtras?: JSX.Element | JSX.Element[];
    card: React.ComponentType<CardWrapper<T>>;
}

const reanimated = findByProps("useSharedValue");
const { FloatingActionButton } = findByProps("FloatingActionButton");

export default function AddonPage<T>({ title, fetchFunction, items, safeModeMessage, safeModeExtras, card: CardComponent }: AddonPageProps<T>) {
    useProxy(settings)
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
                        placeholder="Search"
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
                data={Object.values(items).filter(i => i.id?.toLowerCase().includes(search))}
                renderItem={({ item, index }) => <CardComponent item={item} index={index} />}
            />
            <FloatingActionButton 
                text={`Install ${title}`}
                icon={getAssetIDByName("DownloadIcon")}
                state={{ collapseText }}
                onPress={() => {
                    // from ./InstallButton.tsx
                    clipboard.getString().then((content) =>
                        showInputAlert({
                            title: `Install ${title}`,
                            initialValue: content.match(HTTP_REGEX_MULTI)?.[0] ?? "",
                            placeholder: "https://example.com/",
                            onConfirm: (input: string) => fetchFunction(input),
                            confirmText: "Install",
                            cancelText: "Cancel",
                        })
                    )
                }} 
            />
        </ErrorBoundary>
    )
}