import { Strings } from "@core/i18n";
import { PyoncordIcon } from "@core/ui/settings";
import { getAssetIDByName } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { getDebugInfo, toggleSafeMode } from "@lib/debug";
import { settings } from "@lib/settings";
import { Stack, TableRow, TableRowGroup, TableSwitchRow, useNavigation } from "@lib/ui/components/discord/Redesign";
import { DISCORD_SERVER, GITHUB } from "@lib/utils/constants";
import { url } from "@metro/common";
import { NativeModules, ScrollView } from "react-native";

import About from "./About";

export default function General() {
    useProxy(settings);

    const debugInfo = getDebugInfo();
    const navigation = useNavigation();

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
            <Stack style={{ paddingVertical: 24, paddingHorizontal: 12 }} spacing={24}>
                <TableRowGroup title={Strings.INFO}>
                    <TableRow
                        label={Strings.BUNNY}
                        icon={<TableRow.Icon source={{ uri: PyoncordIcon }} />}
                        trailing={<TableRow.TrailingText text={debugInfo.bunny.version} />}
                    />
                    <TableRow
                        label={"Discord"}
                        icon={<TableRow.Icon source={getAssetIDByName("Discord")} />}
                        trailing={<TableRow.TrailingText text={`${debugInfo.discord.version} (${debugInfo.discord.build})`} />}
                    />
                    <TableRow
                        arrow
                        label={Strings.ABOUT}
                        icon={<TableRow.Icon source={getAssetIDByName("CircleInformationIcon")} />}
                        trailing={TableRow.Arrow}
                        onPress={() => navigation.push("VendettaCustomPage", {
                            title: Strings.ABOUT,
                            render: () => <About />,
                        })}
                    />
                </TableRowGroup>
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
                        onPress={() => NativeModules.BundleUpdaterManager.reload()}
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
                <TableRowGroup title={Strings.MISCELLANEOUS}>
                    <TableSwitchRow
                        label={Strings.SETTINGS_ACTIVATE_DISCORD_EXPERIMENTS}
                        subLabel={Strings.SETTINGS_ACTIVATE_DISCORD_EXPERIMENTS_DESC}
                        icon={<TableRow.Icon source={getAssetIDByName("ic_progress_wrench_24px")} />}
                        value={settings.enableDiscordDeveloperSettings}
                        onValueChange={(v: boolean) => {
                            settings.enableDiscordDeveloperSettings = v;
                        }}
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
