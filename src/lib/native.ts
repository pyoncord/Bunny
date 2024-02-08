import { MMKVManager as _MMKVManager, FileManager as _FileManager } from "@types";
const nmp = window.nativeModuleProxy;

export const MMKVManager = nmp.MMKVManager as _MMKVManager;
//! 173.10 renamed this to RTNFileManager.
export const FileManager = (nmp.DCDFileManager ?? nmp.RTNFileManager) as _FileManager;
//! 173.13 renamed this to RTNClientInfoManager.
export const ClientInfoManager = nmp.InfoDictionaryManager ?? nmp.RTNClientInfoManager;
//! 173.14 renamed this to RTNDeviceManager.
export const DeviceManager = nmp.DCDDeviceManager ?? nmp.RTNDeviceManager;
export const BundleUpdaterManager = nmp.BundleUpdaterManager;
export const ThemeManager = nmp.RTNThemeManager ?? nmp.DCDTheme;