import { findExports } from "@metro/finders";
import { Dispatcher } from "@metro/types";
import { createSimpleFilter, findByProps } from "@metro/utils";

// Discord
export const constants = findByProps("Fonts", "Permissions");
export const channels = findByProps("getVoiceChannelId");
export const i18n = findByProps("Messages");
export const url = findByProps("openURL", "openDeeplink");
export const clipboard = findByProps("setString", "getString", "hasString") as typeof import("@react-native-clipboard/clipboard").default;
export const assets = findByProps("registerAsset");
export const invites = findByProps("acceptInviteAndTransitionToInviteChannel");
export const commands = findByProps("getBuiltInCommands");
export const navigation = findByProps("pushLazy");
export const toasts = findExports(createSimpleFilter(
    m => m.open && m.close && !m.startDrag && !m.init && !m.openReplay && !m.setAlwaysOnTop && !m.setAccountFlag,
    "bunny.metro.common.toasts"
));
export const messageUtil = findByProps("sendBotMessage");
export const navigationStack = findByProps("createStackNavigator");
export const NavigationNative = findByProps("NavigationContainer");

// Flux
export const Flux = findByProps("connectStores");
export const FluxDispatcher = findByProps("_interceptors") as Dispatcher;

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
