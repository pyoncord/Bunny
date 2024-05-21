import { Dispatcher } from "@metro/types";
import { findByFilePath, findByPropsProxy } from "@metro/utils";

// Discord
export const constants = findByPropsProxy("Fonts", "Permissions");
export const channels = findByPropsProxy("getVoiceChannelId");
export const i18n = findByPropsProxy("Messages");
export const url = findByPropsProxy("openURL", "openDeeplink");
export const clipboard = findByPropsProxy("setString", "getString", "hasString") as typeof import("@react-native-clipboard/clipboard").default;
export const assets = findByPropsProxy("registerAsset");
export const invites = findByPropsProxy("acceptInviteAndTransitionToInviteChannel");
export const commands = findByPropsProxy("getBuiltInCommands");
export const navigation = findByPropsProxy("pushLazy");
export const toasts = findByFilePath("modules/toast/native/ToastActionCreators.tsx").default;
export const messageUtil = findByPropsProxy("sendBotMessage");
export const navigationStack = findByPropsProxy("createStackNavigator");
export const NavigationNative = findByPropsProxy("NavigationContainer");

// Flux
export const Flux = findByPropsProxy("connectStores");
export const FluxDispatcher = findByPropsProxy("_interceptors") as Dispatcher;

// React
export const React = window.React = findByPropsProxy("createElement") as typeof import("react");
export const ReactNative = window.ReactNative = findByPropsProxy("AppRegistry") as typeof import("react-native");

// Moment
export const moment = findByPropsProxy("isMoment") as typeof import("moment");

// chroma.js
export const chroma = findByPropsProxy("brewer") as typeof import("chroma-js");

// Lodash
export const lodash = findByPropsProxy("forEachRight") as typeof import("lodash");

// The node:util polyfill for RN
// TODO: Find types for this
export const util = findByPropsProxy("inspect", "isNullOrUndefined");
