import { findByDisplayName, findByName, findByProps } from "@metro/filters";

export * as Forms from "./Forms";
export * as Redesign from "./Redesign";

// Discord
export const Alert = findByDisplayName("FluxContainer(Alert)");
export const Button = findByProps("Looks", "Colors", "Sizes") as React.ComponentType<any> & { Looks: any, Colors: any, Sizes: any; };
export const HelpMessage = findByName("HelpMessage");
// React Native's included SafeAreaView only adds padding on iOS.
export const SafeAreaView = findByProps("useSafeAreaInsets").SafeAreaView as any;
