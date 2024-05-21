import { findByDisplayNameProxy, findByNameProxy, findByPropsProxy } from "@metro/utils";

export * as Forms from "./Forms";
export * as Redesign from "./Redesign";

// Discord
export const Alert = findByDisplayNameProxy("FluxContainer(Alert)");
export const Button = findByPropsProxy("Looks", "Colors", "Sizes") as React.ComponentType<any> & { Looks: any, Colors: any, Sizes: any; };
export const HelpMessage = findByNameProxy("HelpMessage");
// React Native's included SafeAreaView only adds padding on iOS.
export const SafeAreaView = findByPropsProxy("useSafeAreaInsets").SafeAreaView as any;
