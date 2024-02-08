import { ReactNative as RN, stylesheet, url } from "@metro/common";
import { DISCORD_SERVER, GITHUB } from "@lib/constants";
import { getDebugInfo, toggleSafeMode } from "@lib/debug";
import { useProxy } from "@lib/storage";
import { getAssetIDByName } from "@ui/assets";
import { Summary } from "@ui/components";
import settings from "@lib/settings";
import Version from "@ui/settings/components/Version";
import { findByProps } from "@lib/metro/filters";
import { semanticColors } from "@ui/color";

const { Stack, TableRow, TableSwitchRow, TableRowGroup } = findByProps("TableRow");
const debugInfo = getDebugInfo() as any;

const styles = stylesheet.createThemedStyleSheet({
    container: {
        flex: 1,
        backgroundColor: semanticColors.BACKGROUND_MOBILE_SECONDARY,
    }
})

export default function General() {
    useProxy(settings);

    const versions = [
        {
            label: "Pyondetta",
            version: debugInfo.vendetta.version,
            icon: "ic_progress_wrench_24px",
        },
        {
            label: "Discord",
            version: `${debugInfo.discord.version} (${debugInfo.discord.build})`,
            icon: "Discord",
        },
        {
            label: "React",
            version: debugInfo.react.version,
            icon: "ic_category_16px",
        },
        {
            label: "React Native",
            version: debugInfo.react.nativeVersion,
            icon: "mobile",
        },
        {
            label: "Bytecode",
            version: debugInfo.hermes.bytecodeVersion,
            icon: "ic_server_security_24px",
        },
    ];

    const platformInfo = [
        {
            label: "Loader",
            version: debugInfo.vendetta.loader,
            icon: "ic_download_24px",
        },
        {
            label: "Operating System",
            version: `${debugInfo.os.name} ${debugInfo.os.version}`,
            icon: "ic_cog_24px"
        },
        ...(debugInfo.os.sdk ? [{
            label: "SDK",
            version: debugInfo.os.sdk,
            icon: "pencil"
        }] : []),
        {
            label: "Manufacturer",
            version: debugInfo.device.manufacturer,
            icon: "ic_badge_staff"
        },
        {
            label: "Brand",
            version: debugInfo.device.brand,
            icon: "ic_settings_boost_24px"
        },
        {
            label: "Model",
            version: debugInfo.device.model,
            icon: "ic_phonelink_24px"
        },
        {
            label: RN.Platform.select({ android: "Codename", ios: "Machine ID" })!,
            version: debugInfo.device.codename,
            icon: "ic_compose_24px"
        }
    ];

    return (
        <RN.ScrollView style={styles.container}>
            <Stack style={{ paddingVertical: 24, paddingHorizontal: 12 }} spacing={24}>
                <TableRowGroup title="Links">
                    <TableRow
                        label="Discord Server"
                        icon={<TableRow.Icon source={getAssetIDByName("Discord")} />}
                        trailing={TableRow.Arrow}
                        onPress={() => url.openDeeplink(DISCORD_SERVER)}
                    />
                    <TableRow
                        label="GitHub"
                        icon={<TableRow.Icon source={getAssetIDByName("img_account_sync_github_white")} />}
                        trailing={TableRow.Arrow}
                        onPress={() => url.openURL(GITHUB)}
                    />
                </TableRowGroup>
                <TableRowGroup title="Actions">
                    <TableRow
                        label="Reload Discord"
                        icon={<TableRow.Icon source={getAssetIDByName("ic_message_retry")} />}
                        onPress={() => RN.NativeModules.BundleUpdaterManager.reload()}
                    />
                    <TableRow
                        label={settings.safeMode?.enabled ? "Return to Normal Mode" : "Reload in Safe Mode"}
                        subLabel={`This will reload Discord ${settings.safeMode?.enabled ? "normally." : "without loading addons."}`}
                        icon={<TableRow.Icon source={getAssetIDByName("ic_privacy_24px")} />}
                        onPress={toggleSafeMode}
                    />
                    <TableSwitchRow
                        label="Developer Settings"
                        icon={<TableRow.Icon source={getAssetIDByName("ic_progress_wrench_24px")} />}
                        value={settings.developerSettings}
                        onValueChange={(v: boolean) => {
                            settings.developerSettings = v;
                        }}
                    />
                </TableRowGroup>
                <TableRowGroup title="Info">
                    <Summary noPadding label="Versions" icon="ic_information_filled_24px">
                        {versions.map(v => <Version padding label={v.label} version={v.version} icon={v.icon} />)}
                    </Summary>
                    <Summary noPadding label="Platform" icon="ic_mobile_device">
                        {platformInfo.map(p => <Version padding label={p.label} version={p.version} icon={p.icon} />)}
                    </Summary>
                </TableRowGroup>
            </Stack>
        </RN.ScrollView>
    )
}