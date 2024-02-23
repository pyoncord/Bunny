import { RNConstants } from "@types";
import { ReactNative as RN } from "@metro/common";
import { after } from "@lib/patcher";
import { getThemeFromLoader, selectTheme } from "@lib/themes";
import { ClientInfoManager, DeviceManager, BundleUpdaterManager } from "@lib/native";
import { getAssetIDByName } from "@ui/assets";
import { showToast } from "@ui/toasts";
import settings from "@lib/settings";
import logger from "@lib/logger";
import { getLoaderName, isThemeSupported } from "./loader";
export let socket: WebSocket;

export async function toggleSafeMode() {
    settings.safeMode = { ...settings.safeMode, enabled: !settings.safeMode?.enabled }
    if (isThemeSupported()) {
        if (getThemeFromLoader()?.id) settings.safeMode!.currentThemeId = getThemeFromLoader()!.id;
        if (settings.safeMode?.enabled) {
            await selectTheme("default");
        } else if (settings.safeMode?.currentThemeId) {
            await selectTheme(settings.safeMode?.currentThemeId);
        }
    }
    setTimeout(BundleUpdaterManager.reload, 400);
}

export function connectToDebugger(url: string) {
    if (socket !== undefined && socket.readyState !== WebSocket.CLOSED) socket.close();

    if (!url) {
        showToast("Invalid debugger URL!", getAssetIDByName("Small"));
        return;
    }

    socket = new WebSocket(`ws://${url}`);

    socket.addEventListener("open", () => showToast("Connected to debugger.", getAssetIDByName("Check")));
    socket.addEventListener("message", (message: any) => {
        try {
            (0, eval)(message.data);
        } catch (e) {
            console.error(e);
        }
    });

    socket.addEventListener("error", (err: any) => {
        console.log(`Debugger error: ${err.message}`);
        showToast("An error occurred with the debugger connection!", getAssetIDByName("Small"));
    });
}

export function patchLogHook() {
    const unpatch = after("nativeLoggingHook", globalThis, (args) => {
        if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ message: args[0], level: args[1] }));
        logger.log(args[0]);
    });

    return () => {
        socket && socket.close();
        unpatch();
    }
}

export const versionHash: string = __vendettaVersion;

export function getDebugInfo() {
    // Hermes
    const hermesProps = window.HermesInternal.getRuntimeProperties();
    const hermesVer = hermesProps["OSS Release Version"];
    const padding = "for RN ";

    // RN
    const PlatformConstants = RN.Platform.constants as RNConstants;
    const rnVer = PlatformConstants.reactNativeVersion;

    return {
        vendetta: {
            version: versionHash,
            loader: getLoaderName(),
        },
        discord: {
            version: ClientInfoManager.Version,
            build: ClientInfoManager.Build,
        },
        react: {
            version: React.version,
            nativeVersion: hermesVer.startsWith(padding) ? hermesVer.substring(padding.length) : `${rnVer.major}.${rnVer.minor}.${rnVer.patch}`,
        },
        hermes: {
            version: hermesVer,
            buildType: hermesProps["Build"],
            bytecodeVersion: hermesProps["Bytecode Version"],
        },
        ...RN.Platform.select(
            {
                android: {
                    os: {
                        name: "Android",
                        version: PlatformConstants.Release,
                        sdk: PlatformConstants.Version
                    },
                },
                ios: {
                    os: {
                        name: PlatformConstants.systemName,
                        version: PlatformConstants.osVersion
                    },
                }
            }
        )!,
        ...RN.Platform.select(
            {
                android: {
                    device: {
                        manufacturer: PlatformConstants.Manufacturer,
                        brand: PlatformConstants.Brand,
                        model: PlatformConstants.Model,
                        codename: DeviceManager.device
                    }
                },
                ios: {
                    device: {
                        manufacturer: DeviceManager.deviceManufacturer,
                        brand: DeviceManager.deviceBrand,
                        model: DeviceManager.deviceModel,
                        codename: DeviceManager.device
                    }
                }
            }
        )!
    }
}
