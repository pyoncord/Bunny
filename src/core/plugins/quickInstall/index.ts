import patchForumPost from "./forumPost";
import patchUrl from "./url";

export default function onLoad() {
    const patches = new Array<Function>;

    patches.push(patchForumPost());
    patches.push(patchUrl());

    return () => patches.forEach(p => p());
}
