import { find, findByProps } from "@metro/filters";
import { Dispatcher } from "@metro/types";

// Discord
export const constants = findByProps("Fonts", "Permissions");
export const channels = findByProps("getVoiceChannelId");
export const i18n = findByProps("Messages");
export const url = findByProps("openURL", "openDeeplink");
export const toasts = find(m => m.open && m.close && !m.startDrag && !m.init && !m.openReplay && !m.setAlwaysOnTop && !m.setAccountFlag);
export const clipboard = findByProps("setString", "getString", "hasString") as typeof import("@react-native-clipboard/clipboard").default;
export const assets = findByProps("registerAsset");
export const invites = findByProps("acceptInviteAndTransitionToInviteChannel");
export const commands = findByProps("getBuiltInCommands");
export const navigation = findByProps("pushLazy");
export const messageUtil = findByProps("sendBotMessage");
export const navigationStack = findByProps("createStackNavigator");
export const NavigationNative = findByProps("NavigationContainer");

// Flux
export const Flux = findByProps("connectStores");
export const FluxDispatcher = findByProps("_currentDispatchActionType") as Dispatcher;

// React
export const React = window.React = findByProps("createElement") as typeof import("react");
export const ReactNative = window.ReactNative = findByProps("AppRegistry") as typeof import("react-native");

// Moment
export const moment = findByProps("isMoment") as typeof import("moment");

// chroma.js
export const chroma = findByProps("brewer") as typeof import("chroma-js");

// Lodash
export const lodash = findByProps("forEachRight") as typeof import("lodash");

// The node:util polyfill for RN
// TODO: Find types for this
export const util = findByProps("inspect", "isNullOrUndefined");
