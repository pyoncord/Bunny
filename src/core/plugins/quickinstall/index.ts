import { defineCorePlugin } from "..";
import patchForumPost from "./forumPost";
import patchUrl from "./url";

let patches = [] as (() => unknown)[];

export default defineCorePlugin({
    manifest: {
        id: "bunny.quickinstall",
        name: "QuickInstall",
        version: "1.0.0",
        description: "Quickly install Vendetta plugins and themes",
        authors: [{ name: "Vendetta Team" }]
    },
    start() {
        patches = [patchForumPost(), patchUrl()];
    },
    stop() {
        patches.forEach(p => p());
    }
});
