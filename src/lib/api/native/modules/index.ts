import { RNModules } from "./types";

const nmp = window.nativeModuleProxy;

export const MMKVManager = nmp.MMKVManager as RNModules.MMKVManager;
export const FileManager = (nmp.DCDFileManager ?? nmp.RTNFileManager) as RNModules.FileManager;
export const ClientInfoManager = nmp.InfoDictionaryManager ?? nmp.RTNClientInfoManager;
export const DeviceManager = nmp.DCDDeviceManager ?? nmp.RTNDeviceManager;
export const { BundleUpdaterManager } = nmp;
export const ThemeManager = nmp.RTNThemeManager ?? nmp.DCDTheme;

