import { Strings } from "@core/i18n";
import { CardWrapper } from "@core/ui/components/AddonCard";
import { findAssetId } from "@lib/api/assets";
import { settings } from "@lib/api/settings";
import { useProxy } from "@lib/api/storage";
import { HTTP_REGEX_MULTI } from "@lib/utils/constants";
import { lazyDestructure } from "@lib/utils/lazy";
import { findByProps } from "@metro";
import { clipboard } from "@metro/common";
import { Button, FlashList, FloatingActionButton, HelpMessage, IconButton, Text } from "@metro/common/components";
import { showInputAlert } from "@ui/alerts";
import { ErrorBoundary, Search } from "@ui/components";
import fuzzysort from "fuzzysort";
import { ComponentType, ReactNode, useCallback, useMemo } from "react";
import { Image, View } from "react-native";

const { showSimpleActionSheet, hideActionSheet } = lazyDestructure(() => findByProps("showSimpleActionSheet"));

type SearchKeywords = Array<string | ((obj: any & {}) => string)>;

interface AddonPageProps<T extends object, I = any> {
    title: string;
    items: I[];
    searchKeywords: SearchKeywords;
    sortOptions?: Record<string, (a: I, b: I) => number>;
    resolveItem?: (value: I) => T | undefined;
    safeModeHint?: {
        message?: string;
        footer?: ReactNode;
    }
    installAction?: {
        label?: string;
        // Ignored when onPress is defined!
        fetchFn?: (url: string) => Promise<void>;
        onPress?: () => void;
    }
    CardComponent: ComponentType<CardWrapper<T>>;
    ListHeaderComponent?: ComponentType<any>;
    ListFooterComponent?: ComponentType<any>;
}

export default function AddonPage<T extends object>({ CardComponent, ...props }: AddonPageProps<T>) {
    useProxy(settings);

    const [search, setSearch] = React.useState("");
    const [sortFn, setSortFn] = React.useState<((a: unknown, b: unknown) => number) | null>(() => null);

    const results = useMemo(() => {
        let values = props.items;
        if (props.resolveItem) values = values.map(props.resolveItem);
        const items = values.filter(i => i && typeof i === "object");
        if (!search && sortFn) items.sort(sortFn);

        return fuzzysort.go(search, items, { keys: props.searchKeywords, all: true });
    }, [props.items, sortFn, search]);

    const onInstallPress = useCallback(() => {
        if (!props.installAction) return () => {};
        const { onPress, fetchFn } = props.installAction;
        if (fetchFn) {
            clipboard.getString().then((content: string) =>
                showInputAlert({
                    title: props.installAction?.label,
                    initialValue: content.match(HTTP_REGEX_MULTI)?.[0] ?? "",
                    placeholder: Strings.URL_PLACEHOLDER,
                    onConfirm: (input: string) => fetchFn(input),
                    confirmText: Strings.INSTALL,
                    cancelText: Strings.CANCEL,
                })
            );
        } else {
            onPress?.();
        }
    }, []);

    if (results.length === 0 && !search) {
        return <View style={{ gap: 32, flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
            <View style={{ gap: 8, alignItems: "center" }}>
                <Image source={findAssetId("empty_quick_switcher")} />
                <Text variant="text-lg/semibold" color="text-normal">
                    Oops! Nothing to see here… yet!
                </Text>
            </View>
            <Button
                size="lg"
                icon={findAssetId("DownloadIcon")}
                text={props.installAction?.label ?? "Install"}
                onPress={onInstallPress}
            />
        </View>;
    }

    const headerElement = (
        <View style={{ paddingBottom: 8 }}>
            {props.ListHeaderComponent && <props.ListHeaderComponent />}
            {settings.safeMode?.enabled && <View style={{ marginBottom: 10 }}>
                <HelpMessage messageType={0}>
                    {props.safeModeHint?.message}
                </HelpMessage>
                {props.safeModeHint?.footer}
            </View>}
            <View style={{ flexDirection: "row", gap: 8 }}>
                <Search style={{ flexGrow: 1 }} isRound={!!props.sortOptions} onChangeText={v => setSearch(v)} />
                {props.sortOptions && <IconButton
                    icon={findAssetId("ic_forum_channel_sort_order_24px")}
                    variant="secondary"
                    disabled={!!search}
                    onPress={() => showSimpleActionSheet({
                        key: "AddonListSortOptions",
                        header: {
                            title: "Sort Options",
                            onClose: () => hideActionSheet("AddonListSortOptions"),
                        },
                        options: Object.entries(props.sortOptions!).map(([name, fn]) => ({
                            label: name,
                            onPress: () => setSortFn(() => fn)
                        }))
                    })}
                />}
            </View>
        </View>
    );

    return (
        <ErrorBoundary>
            <FlashList
                data={results}
                extraData={search}
                estimatedItemSize={136}
                ListHeaderComponent={headerElement}
                ListEmptyComponent={() => <View style={{ gap: 12, padding: 12, alignItems: "center" }}>
                    <Image source={findAssetId("devices_not_found")} />
                    <Text variant="text-lg/semibold" color="text-normal">
                        Hmmm... could not find that!
                    </Text>
                </View>}
                contentContainerStyle={{ padding: 8, paddingHorizontal: 12 }}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                ListFooterComponent={props.ListFooterComponent}
                renderItem={({ item }: any) => <CardComponent item={item.obj} result={item} />}
            />
            {props.installAction && <FloatingActionButton
                icon={findAssetId("PlusLargeIcon")}
                onPress={onInstallPress}
            />}
        </ErrorBoundary>
    );
}
