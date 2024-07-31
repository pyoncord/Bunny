import { Strings } from "@core/i18n";
import { CardWrapper } from "@core/ui/components/AddonCard";
import { findAssetId } from "@lib/api/assets";
import { settings } from "@lib/api/settings";
import { useProxy } from "@lib/api/storage";
import { HTTP_REGEX_MULTI } from "@lib/utils/constants";
import { findByProps } from "@metro";
import { clipboard } from "@metro/common";
import { FloatingActionButton, HelpMessage } from "@metro/common/components";
import { showInputAlert } from "@ui/alerts";
import { ErrorBoundary, Search } from "@ui/components";
import fuzzysort from "fuzzysort";
import { ComponentType, ReactNode, useMemo } from "react";
import { View } from "react-native";

type SearchKeywords = Array<string | ((obj: any & {}) => string)>;

interface AddonPageProps<T extends object> {
    title: string;
    fetchFunction?: (url: string) => Promise<void>;
    items: any[];
    resolveItem?: (value: any) => T | undefined;
    safeModeMessage: string;
    safeModeExtras?: ReactNode;
    card: ComponentType<CardWrapper<T>>;
    searchKeywords: SearchKeywords;
    onFabPress?: () => void;
    ListFooterComponent?: ReactNode | ComponentType;
}

// TODO: Move to somewhere else
const { FlashList } = findByProps("FlashList");

export default function AddonPage<T extends object>({ card: CardComponent, ...props }: AddonPageProps<T>) {
    useProxy(settings);

    const [search, setSearch] = React.useState("");

    const items = useMemo(() => {
        let values = props.items;
        if (props.resolveItem) values = values.map(props.resolveItem);
        return values.filter(i => i && typeof i === "object");
    }, [props.items]);

    const data = useMemo(() => {
        if (!search) return items;
        return fuzzysort.go(search, items, { keys: props.searchKeywords }).map(r => r.obj);
    }, [items, search]);

    const headerElement = useMemo(() => (
        <View>
            {settings.safeMode?.enabled && <View style={{ marginBottom: 10 }}>
                <HelpMessage messageType={0}>{props.safeModeMessage}</HelpMessage>
                {props.safeModeExtras}
            </View>}
            <Search
                style={{ padding: 8 }}
                onChangeText={v => setSearch(v)}
            />
        </View>
    ), []);

    return (
        <ErrorBoundary>
            <FlashList
                data={data}
                estimatedItemSize={136}
                ListHeaderComponent={headerElement}
                contentContainerStyle={{ paddingBottom: 90, paddingHorizontal: 5 }}
                ListFooterComponent={props.ListFooterComponent}
                renderItem={({ item }: any) => (
                    <View style={{ paddingVertical: 6, paddingHorizontal: 8 }}>
                        <CardComponent item={item} />
                    </View>
                )}
            />
            {(props.fetchFunction ?? props.onFabPress) && <FloatingActionButton
                icon={findAssetId("PlusLargeIcon")}
                onPress={props.onFabPress ?? (() => {
                    // from ./InstallButton.tsx
                    clipboard.getString().then((content: string) =>
                        showInputAlert({
                            initialValue: content.match(HTTP_REGEX_MULTI)?.[0] ?? "",
                            placeholder: Strings.URL_PLACEHOLDER,
                            onConfirm: (input: string) => props.fetchFunction!(input),
                            confirmText: Strings.INSTALL,
                            cancelText: Strings.CANCEL,
                        })
                    );
                })}
            />}
        </ErrorBoundary>
    );
}
