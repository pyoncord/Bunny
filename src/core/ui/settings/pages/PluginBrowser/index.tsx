import { installPlugin, isPluginInstalled, uninstallPlugin } from "@lib/addons/plugins";
import { BunnyPluginManifest } from "@lib/addons/plugins/types";
import { findAssetId } from "@lib/api/assets";
import { showToast } from "@lib/ui/toasts";
import { safeFetch } from "@lib/utils";
import { OFFICIAL_PLUGINS_REPO_URL } from "@lib/utils/constants";
import { Button, Card, FlashList, IconButton, Stack, Text } from "@metro/common/components";
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { chunk } from "es-toolkit";
import { useState } from "react";
import { View } from "react-native";

const queryClient = new QueryClient();

async function arrayFromAsync<T>(iterableOrArrayLike: AsyncIterable<T>): Promise<T[]> {
    const arr: T[] = [];
    for await (const element of iterableOrArrayLike) arr.push(element);
    return arr;
}

async function fetchManifest(repoURL: string, id: string) {
    const url = new URL(`plugins/${id}/manifest.json`, repoURL);
    const data = await safeFetch(url).then(d => d.json());

    queryClient.setQueryData(["plugin-manifest-dist", { id }], data);

    return data as BunnyPluginManifest;
}

async function* getManifests(repoUrl: string) {
    const rawResponse = await safeFetch(repoUrl);
    const pluginIds = Object.keys(await rawResponse.json());

    for (const idChunks of chunk(pluginIds, 5)) {
        const manifests = idChunks.map(id => fetchManifest(OFFICIAL_PLUGINS_REPO_URL, id));
        for (const manifest of manifests) {
            yield await manifest;
        }
    }
}

function InstallButton(props: { id: string; }) {
    const [installed, setInstalled] = useState(isPluginInstalled(props.id));
    const installationState = useMutation<void, Error, { install: boolean; }>({
        mutationFn: async ({ install }) => {
            await (install ? installPlugin : uninstallPlugin)(props.id, true);
        },
        onSettled() {
            setInstalled(isPluginInstalled(props.id));
        },
        onError(error) {
            showToast(error instanceof Error ? error.message : String(error));
        }
    });

    return <Button
        size="sm"
        loading={installationState.isPending}
        text={!installed ? "Install" : "Uninstall"}
        onPress={() => installationState.mutate({ install: !installed })}
        variant={!installed ? "primary" : "destructive"}
        icon={findAssetId(!installed ? "DownloadIcon" : "TrashIcon")}
    />;
}

function TrailingButtons(props: { id: string; }) {
    return <Stack spacing={8} direction="horizontal">
        <IconButton
            size="sm"
            onPress={() => { }}
            variant="secondary"
            icon={findAssetId("CircleInformationIcon")}
        />
        <InstallButton id={props.id} />
    </Stack>;
}

function PluginCard(props: { repoUrl: string, id: string, manifest: BunnyPluginManifest; }) {
    const { isPending, error, data: plugin } = useQuery({
        queryKey: ["plugin-manifest-dist", { id: props.id }],
        queryFn: () => fetchManifest(props.repoUrl, props.id)
    });

    return (
        <Card>
            {!plugin && <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text color="text-muted" variant="heading-lg/semibold">
                    {isPending && "Loading..."}
                    {error && `An error has occured while fetching plugin: ${error.message}`}
                </Text>
            </View>}
            {plugin && <Stack spacing={16}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexShrink: 1 }}>
                        <Text numberOfLines={1} variant="heading-lg/semibold">
                            {plugin.name}
                        </Text>
                        <Text variant="text-md/semibold" color="text-muted">
                            by {plugin.authors.map(a => typeof a === "string" ? a : a.name).join(", ")}
                        </Text>
                    </View>
                    <View>
                        <TrailingButtons id={props.id} />
                    </View>
                </View>
                <Text variant="text-md/medium">
                    {plugin.description}
                </Text>
            </Stack>}
        </Card>
    );
}

function BrowserPage() {
    const { data, error, isPending, refetch } = useQuery({
        queryKey: ["plugins-repo-fetch"],
        queryFn: () => arrayFromAsync(getManifests(OFFICIAL_PLUGINS_REPO_URL))
    });

    if (error) {
        return <View style={{
            flex: 1,
            paddingHorizontal: 8,
            justifyContent: "center",
            alignItems: "center",
        }}>
            <Card style={{ gap: 8 }}>
                <Text style={{ textAlign: "center" }} variant="heading-lg/bold">
                    An error occured while fetching the repository!
                </Text>
                <Text style={{ textAlign: "center" }} variant="text-sm/medium" color="text-muted">
                    {error instanceof Error ? error.message : String(error)}
                </Text>
                <Button
                    size="lg"
                    text="Refetch"
                    onPress={refetch}
                    icon={findAssetId("RetryIcon")}
                />
            </Card>
        </View>;
    }

    return <FlashList
        data={data}
        refreshing={isPending}
        onRefresh={refetch}
        estimatedItemSize={136}
        contentContainerStyle={{ paddingBottom: 90, paddingHorizontal: 5 }}
        renderItem={({ item: manifest }: any) => (
            <View style={{ paddingVertical: 6, paddingHorizontal: 8 }}>
                <PluginCard repoUrl={OFFICIAL_PLUGINS_REPO_URL} id={manifest.id} manifest={manifest} />
            </View>
        )}
    />;
}

export default function PluginBrowser() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserPage />
        </QueryClientProvider>
    );
}
