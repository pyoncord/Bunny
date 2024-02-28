import { ReactNative as RN, stylesheet, url } from "@metro/common";
import { DISCORD_SERVER, GITHUB } from "@lib/utils/constants";
import { getDebugInfo, toggleSafeMode } from "@lib/debug";
import { useProxy } from "@/lib/api/storage";
import { getAssetIDByName } from "@/lib/api/assets";
import { Summary } from "@ui/components";
import { settings } from "@lib/settings";
import Version from "@/core/ui/components/Version";
import { findByProps } from "@lib/metro/filters";
import { semanticColors } from "@ui/color";
import { Strings } from "@/core/i18n";

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
            label: Strings.BUNNY,
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
            label: Strings.BYTECODE,
            version: debugInfo.hermes.bytecodeVersion,
            icon: "ic_server_security_24px",
        },
    ];

    const platformInfo = [
        {
            label: Strings.LOADER,
            version: debugInfo.vendetta.loader,
            icon: "ic_download_24px",
        },
        {
            label: Strings.OPERATING_SYSTEM,
            version: `${debugInfo.os.name} ${debugInfo.os.version}`,
            icon: "ic_cog_24px"
        },
        ...(debugInfo.os.sdk ? [{
            label: "SDK",
            version: debugInfo.os.sdk,
            icon: "pencil"
        }] : []),
        {
            label: Strings.MANUFACTURER,
            version: debugInfo.device.manufacturer,
            icon: "ic_badge_staff"
        },
        {
            label: Strings.BRAND,
            version: debugInfo.device.brand,
            icon: "ic_settings_boost_24px"
        },
        {
            label: Strings.PHONE_MODEL,
            version: debugInfo.device.model,
            icon: "ic_phonelink_24px"
        },
        {
            label: RN.Platform.select({ android: Strings.CODENAME, ios: Strings.MACHINE_ID })!,
            version: debugInfo.device.codename,
            icon: "ic_compose_24px"
        }
    ];

    return (
        <RN.ScrollView style={styles.container}>
            <Stack style={{ paddingVertical: 24, paddingHorizontal: 12 }} spacing={24}>
                <TableRowGroup title={Strings.LINKS}>
                    <TableRow
                        label={Strings.DISCORD_SERVER}
                        icon={<TableRow.Icon source={getAssetIDByName("Discord")} />}
                        trailing={TableRow.Arrow}
                        onPress={() => url.openDeeplink(DISCORD_SERVER)}
                    />
                    <TableRow
                        label={Strings.GITHUB}
                        icon={<TableRow.Icon source={getAssetIDByName("img_account_sync_github_white")} />}
                        trailing={TableRow.Arrow}
                        onPress={() => url.openURL(GITHUB)}
                    />
                </TableRowGroup>
                <TableRowGroup title={Strings.ACTIONS}>
                    <TableRow
                        label={Strings.RELOAD_DISCORD}
                        icon={<TableRow.Icon source={getAssetIDByName("ic_message_retry")} />}
                        onPress={() => RN.NativeModules.BundleUpdaterManager.reload()}
                    />
                    <TableRow
                        label={settings.safeMode?.enabled ? Strings.RELOAD_IN_NORMAL_MODE : Strings.RELOAD_IN_SAFE_MODE}
                        subLabel={settings.safeMode?.enabled ? Strings.RELOAD_IN_NORMAL_MODE_DESC : Strings.RELOAD_IN_SAFE_MODE_DESC}
                        icon={<TableRow.Icon source={getAssetIDByName("ic_privacy_24px")} />}
                        onPress={toggleSafeMode}
                    />
                    <TableSwitchRow
                        label={Strings.DEVELOPER_SETTINGS}
                        icon={<TableRow.Icon source={getAssetIDByName("ic_progress_wrench_24px")} />}
                        value={settings.developerSettings}
                        onValueChange={(v: boolean) => {
                            settings.developerSettings = v;
                        }}
                    />
                </TableRowGroup>
                <TableRowGroup title={Strings.INFO}>
                    <Summary noPadding label={Strings.VERSIONS} icon="ic_information_filled_24px">
                        {versions.map(v => <Version padding label={v.label} version={v.version} icon={v.icon} />)}
                    </Summary>
                    <Summary noPadding label={Strings.PLATFORM} icon="ic_mobile_device">
                        {platformInfo.map(p => <Version padding label={p.label} version={p.version} icon={p.icon} />)}
                    </Summary>
                </TableRowGroup>
            </Stack>
        </RN.ScrollView>
    )
}