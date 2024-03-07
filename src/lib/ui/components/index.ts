import { findByDisplayName, findByName, findByProps } from "@metro/filters";

export * as discord from "./discord";

// Discord
export const Alert = findByDisplayName("FluxContainer(Alert)");
export const Button = findByProps("Looks", "Colors", "Sizes") as React.ComponentType<any> & { Looks: any, Colors: any, Sizes: any; };
export const HelpMessage = findByName("HelpMessage");
// React Native's included SafeAreaView only adds padding on iOS.
export const SafeAreaView = findByProps("useSafeAreaInsets").SafeAreaView as any;

// Vendetta
export { default as Codeblock } from "@ui/components/Codeblock";
export { default as ContextMenu } from "@ui/components/ContextMenu";
export { default as ErrorBoundary } from "@ui/components/ErrorBoundary";
export { default as Search } from "@ui/components/Search";
export { default as Summary } from "@ui/components/Summary";
