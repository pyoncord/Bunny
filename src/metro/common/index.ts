import { findByFilePathLazy, findByProps, findByPropsLazy } from "@metro/wrappers";

import type { Dispatcher } from "./types/flux";

export * as components from "./components";

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
export const toasts = findByFilePathLazy("modules/toast/native/ToastActionCreators.tsx", true);
export const messageUtil = findByPropsLazy("sendBotMessage");
export const navigationStack = findByPropsLazy("createStackNavigator");
export const NavigationNative = findByPropsLazy("NavigationContainer");
export const tokens = findByPropsLazy("colors", "unsafe_rawColors");
export const semver = findByPropsLazy("parse", "clean");

// Flux
export const Flux = findByPropsLazy("connectStores");
// TODO: Making this a proxy/lazy fuck things up for some reason
export const FluxDispatcher = findByProps("_interceptors") as Dispatcher;

// React
export const React = window.React = findByPropsLazy("createElement") as typeof import("react");
export const ReactNative = window.ReactNative = findByPropsLazy("AppRegistry") as typeof import("react-native");
