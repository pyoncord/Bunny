import { proxyLazy } from "@lib/utils/lazy";
import { findByFilePath, findByProps, findByPropsLazy } from "@metro/utils";

import { Dispatcher } from "./types";

// Discord
export const constants = findByPropsLazy("Fonts", "Permissions");
export const channels = findByPropsLazy("getVoiceChannelId");
export const i18n = findByPropsLazy("Messages");
export const url = findByPropsLazy("openURL", "openDeeplink");
export const clipboard = findByPropsLazy("setString", "getString", "hasString");
export const assets = findByPropsLazy("registerAsset");
export const invites = findByPropsLazy("acceptInviteAndTransitionToInviteChannel");
export const commands = findByPropsLazy("getBuiltInCommands");
export const navigation = findByPropsLazy("pushLazy");
export const toasts = proxyLazy(() => findByFilePath("modules/toast/native/ToastActionCreators.tsx").default);
export const messageUtil = findByPropsLazy("sendBotMessage");
export const navigationStack = findByPropsLazy("createStackNavigator");
export const NavigationNative = findByPropsLazy("NavigationContainer");
export const tokens = findByPropsLazy("colors", "unsafe_rawColors");

// Flux
export const Flux = findByPropsLazy("connectStores");
// TODO: Making this a proxy/lazy fuck things up for some reason
export const FluxDispatcher = findByProps("_interceptors") as Dispatcher;

// React
export const React = window.React = findByPropsLazy("createElement") as typeof import("react");
export const ReactNative = window.ReactNative = findByPropsLazy("AppRegistry") as typeof import("react-native");
