import patchForumPost from "@ui/quickInstall/forumPost";
import patchUrl from "@ui/quickInstall/url";

export default function initQuickInstall() {
    const patches = new Array<Function>;

    patches.push(patchForumPost());
    patches.push(patchUrl());

    return () => patches.forEach(p => p());
};
