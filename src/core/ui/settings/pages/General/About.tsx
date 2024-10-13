import { Strings } from "@core/i18n";
import Version from "@core/ui/settings/pages/General/Version";
import { useProxy } from "@core/vendetta/storage";
import { getDebugInfo } from "@lib/api/debug";
import { settings } from "@lib/api/settings";
import { Stack, TableRowGroup } from "@metro/common/components";
import { Platform, ScrollView } from "react-native";

export default function About() {
    const debugInfo = getDebugInfo();
    useProxy(settings);

    const versions = [
        {
            label: Strings.BUNNY,
            version: debugInfo.bunny.version,
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
            version: `${debugInfo.bunny.loader.name} (${debugInfo.bunny.loader.version})`,
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
            label: Strings.MODEL,
            version: debugInfo.device.model,
            icon: "ic_phonelink_24px"
        },
        {
            label: Platform.select({ android: Strings.CODENAME, ios: Strings.MACHINE_ID })!,
            version: debugInfo.device.codename,
            icon: "ic_compose_24px"
        }
    ];

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
            <Stack style={{ paddingVertical: 24, paddingHorizontal: 12 }} spacing={24}>
                <TableRowGroup title={Strings.VERSIONS}>
                    {versions.map(v => <Version label={v.label} version={v.version} icon={v.icon} />)}
                </TableRowGroup>
                <TableRowGroup title={Strings.PLATFORM}>
                    {platformInfo.map(p => <Version label={p.label} version={p.version} icon={p.icon} />)}
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
