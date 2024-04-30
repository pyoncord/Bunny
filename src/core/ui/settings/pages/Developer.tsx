import { Strings } from "@core/i18n";
import { CheckState, useFileExists } from "@core/ui/settings/hooks/useFS";
import AssetBrowser from "@core/ui/settings/pages/AssetBrowser";
import { getAssetIDByName } from "@lib/api/assets";
import { getReactDevToolsProp, getReactDevToolsVersion, isLoaderConfigSupported, isReactDevToolsPreloaded, isVendettaLoader } from "@lib/api/native/loader";
import { useProxy } from "@lib/api/storage";
import { connectToDebugger } from "@lib/debug";
import { loaderConfig, settings } from "@lib/settings";
import { FormText } from "@lib/ui/components/discord/Forms";
import { Button, Stack, TableRow, TableRowGroup, TableSwitchRow, TextInput } from "@lib/ui/components/discord/Redesign";
import { NavigationNative } from "@metro/common";
import { findByProps } from "@metro/filters";
import { semanticColors } from "@ui/color";
import { ErrorBoundary } from "@ui/components";
import { createStyles, TextStyleSheet } from "@ui/styles";
import { ScrollView, StyleSheet } from "react-native";

const { hideActionSheet } = findByProps("openLazy", "hideActionSheet");
const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");

const RDT_EMBED_LINK = "https://raw.githubusercontent.com/amsyarasyiq/rdt-embedder/main/dist.js";

const useStyles = createStyles({
    leadingText: {
        ...TextStyleSheet["heading-md/semibold"],
        color: semanticColors.TEXT_MUTED,
        marginRight: -4
    },
});

export default function Developer() {
    const [rdtFileExists, fs] = useFileExists("preloads/reactDevtools.js");

    const styles = useStyles();
    const navigation = NavigationNative.useNavigation();

    useProxy(settings);
    useProxy(loaderConfig);

    return (
        <ErrorBoundary>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
                <Stack style={{ paddingVertical: 24, paddingHorizontal: 12 }} spacing={24}>
                    <TextInput
                        label={Strings.DEBUGGER_URL}
                        placeholder="127.0.0.1:9090"
                        size="md"
                        leadingIcon={() => <FormText style={styles.leadingText}>ws://</FormText>}
                        defaultValue={settings.debuggerUrl}
                        onChange={(v: string) => settings.debuggerUrl = v}
                    />
                    <TableRowGroup title={Strings.DEBUG}>
                        <TableRow
                            label={Strings.CONNECT_TO_DEBUG_WEBSOCKET}
                            icon={<TableRow.Icon source={getAssetIDByName("copy")} />}
                            onPress={() => connectToDebugger(settings.debuggerUrl)}
                        />
                        {isReactDevToolsPreloaded() && <>
                            <TableRow
                                label={Strings.CONNECT_TO_REACT_DEVTOOLS}
                                icon={<TableRow.Icon source={getAssetIDByName("ic_badge_staff")} />}
                                onPress={() => window[getReactDevToolsProp() || "__vendetta_rdc"]?.connectToDevTools({
                                    host: settings.debuggerUrl.split(":")?.[0],
                                    resolveRNStyle: StyleSheet.flatten,
                                })}
                            />
                        </>}
                    </TableRowGroup>
                    {isLoaderConfigSupported() && <>
                        <TableRowGroup title="Loader config">
                            <TableSwitchRow
                                label={Strings.LOAD_FROM_CUSTOM_URL}
                                subLabel={Strings.LOAD_FROM_CUSTOM_URL_DEC}
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
                                label={Strings.BUNNY_URL}
                            />} />}
                            {isReactDevToolsPreloaded() && isVendettaLoader() && <TableSwitchRow
                                label={Strings.LOAD_REACT_DEVTOOLS}
                                subLabel={`${Strings.VERSION}: ${getReactDevToolsVersion()}`}
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
                            label={Strings.ASSET_BROWSER}
                            icon={<TableRow.Icon source={getAssetIDByName("ic_image")} />}
                            trailing={TableRow.Arrow}
                            onPress={() => navigation.push("VendettaCustomPage", {
                                title: Strings.ASSET_BROWSER,
                                render: AssetBrowser,
                            })}
                        />
                        <TableRow
                            arrow
                            label={Strings.ERROR_BOUNDARY_TOOLS_LABEL}
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
                                    { label: Strings.BUNNY, onPress: () => navigation.push("VendettaCustomPage", { render: () => <undefined /> }) },
                                    { label: "Discord", isDestructive: true, onPress: () => navigation.push("VendettaCustomPage", { noErrorBoundary: true }) },
                                ],
                            })}
                        />
                        <TableRow
                            label={Strings.INSTALL_REACT_DEVTOOLS}
                            subLabel={Strings.RESTART_REQUIRED_TO_TAKE_EFFECT}
                            icon={<TableRow.Icon source={getAssetIDByName("DownloadIcon")} />}
                            trailing={
                                <Button
                                    size="sm"
                                    loading={rdtFileExists === CheckState.LOADING}
                                    disabled={rdtFileExists === CheckState.LOADING}
                                    variant={rdtFileExists === CheckState.TRUE ? "secondary" : "primary"}
                                    text={rdtFileExists === CheckState.TRUE ? Strings.UNINSTALL : Strings.INSTALL}
                                    onPress={async () => {
                                        if (rdtFileExists === CheckState.FALSE) {
                                            fs.downloadFile(RDT_EMBED_LINK, "preloads/reactDevtools.js");
                                        } else if (rdtFileExists === CheckState.TRUE) {
                                            fs.removeFile("preloads/reactDevtools.js");
                                        }
                                    }}
                                    icon={getAssetIDByName(rdtFileExists === CheckState.TRUE ? "ic_message_delete" : "DownloadIcon")}
                                    style={{ marginLeft: 8 }}
                                />
                            }
                        />
                    </TableRowGroup>
                </Stack>
            </ScrollView>
        </ErrorBoundary>
    );
}
