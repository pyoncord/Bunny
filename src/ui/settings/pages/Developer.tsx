import { ReactNative as RN, NavigationNative, stylesheet } from "@metro/common";
import { findByProps } from "@metro/filters";
import { connectToDebugger } from "@lib/debug";
import { useProxy } from "@lib/storage";
import { getAssetIDByName } from "@ui/assets";
import { ErrorBoundary, Forms } from "@ui/components";
import settings, { loaderConfig } from "@lib/settings";
import AssetBrowser from "@ui/settings/pages/AssetBrowser";
import { semanticColors } from "@ui/color";

const { Stack, TableRow, TableSwitchRow, TableRowGroup, TextInput } = findByProps("TableRow");
const { FormText } = Forms;
const { hideActionSheet } = findByProps("openLazy", "hideActionSheet");
const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");
const { TextStyleSheet } = findByProps("TextStyleSheet");

const styles = stylesheet.createThemedStyleSheet({
    leadingText: {
        ...TextStyleSheet["heading-md/semibold"],
        color: semanticColors.TEXT_MUTED,
        marginRight: -4
    },
});

export default function Developer() {
    const navigation = NavigationNative.useNavigation();

    useProxy(settings);
    useProxy(loaderConfig);

    return (
        <ErrorBoundary>
            <RN.ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
                <Stack style={{ paddingVertical: 24, paddingHorizontal: 12 }} spacing={24}>
                    <TextInput
                        label="Debugger URL"
                        placeholder="127.0.0.1:9090"
                        size="md"
                        leadingIcon={() => <FormText style={styles.leadingText}>ws://</FormText>}
                        defaultValue={settings.debuggerUrl}
                        onChange={(v: string) => settings.debuggerUrl = v}
                    />
                    <TableRowGroup title="Debug">
                        <TableRow
                            label="Connect to debug websocket"
                            icon={<TableRow.Icon source={getAssetIDByName("copy")} />}
                            onPress={() => connectToDebugger(settings.debuggerUrl)}
                        />
                        {window.__vendetta_rdc && <>
                            <TableRow
                                label="Connect to React DevTools"
                                icon={<TableRow.Icon source={getAssetIDByName("ic_badge_staff")} />}
                                onPress={() => window.__vendetta_rdc?.connectToDevTools({
                                    host: settings.debuggerUrl.split(":")?.[0],
                                    resolveRNStyle: RN.StyleSheet.flatten,
                                })}
                            />
                        </>}
                    </TableRowGroup>
                    {window.__vendetta_loader?.features.loaderConfig && <>
                        <TableRowGroup title="Loader config">
                            <TableSwitchRow
                                label="Load from custom url"
                                subLabel={"Load Vendetta from a custom endpoint."}
                                icon={<TableRow.Icon source={getAssetIDByName("copy")} />}
                                value={loaderConfig.customLoadUrl.enabled}
                                onValueChange={(v: boolean) => {
                                    loaderConfig.customLoadUrl.enabled = v;
                                }}
                            />
                            {loaderConfig.customLoadUrl.enabled && <TableRow label={<TextInput
                                defaultValue={loaderConfig.customLoadUrl.url}
                                size="md"
                                onChange={(v: string) => loaderConfig.customLoadUrl.url = v}
                                placeholder="http://localhost:4040/vendetta.js"
                                label="Vendetta URL"
                            />} />}
                            {window.__vendetta_loader.features.devtools && <TableSwitchRow
                                label="Load React DevTools"
                                subLabel={`Version: ${window.__vendetta_loader.features.devtools.version}`}
                                icon={<TableRow.Icon source={getAssetIDByName("ic_badge_staff")} />}
                                value={loaderConfig.loadReactDevTools}
                                onValueChange={(v: boolean) => {
                                    loaderConfig.loadReactDevTools = v;
                                }}
                            />}
                        </TableRowGroup>
                    </>}
                    <TableRowGroup title="Other">
                        <TableRow
                            arrow
                            label="Asset Browser"
                            icon={<TableRow.Icon source={getAssetIDByName("ic_image")} />}
                            trailing={TableRow.Arrow}
                            onPress={() => navigation.push("VendettaCustomPage", {
                                title: "Asset Browser",
                                render: AssetBrowser,
                            })}
                        />
                        <TableRow 
                            arrow
                            label="ErrorBoundary Tools"
                            icon={<TableRow.Icon source={getAssetIDByName("ic_warning_24px")} />}
                            onPress={() => showSimpleActionSheet({
                                key: "ErrorBoundaryTools",
                                header: {
                                    title: "Which ErrorBoundary do you want to trip?",
                                    icon: <TableRow.Icon style={{ marginRight: 8 }} source={getAssetIDByName("ic_warning_24px")} />,
                                    onClose: () => hideActionSheet(),
                                },
                                options: [
                                    // @ts-expect-error 
                                    // Of course, to trigger an error, we need to do something incorrectly. The below will do!
                                    { label: "Vendetta", onPress: () => navigation.push("VendettaCustomPage", { render: () => <undefined /> }) },
                                    { label: "Discord", isDestructive: true, onPress: () => navigation.push("VendettaCustomPage", { noErrorBoundary: true }) },
                                ],
                            })}
                        />
                    </TableRowGroup>
                </Stack>
            </RN.ScrollView>
        </ErrorBoundary>
    )
}
