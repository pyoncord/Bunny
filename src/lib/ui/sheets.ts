import { findByPropsLazy } from "@metro/wrappers";

const actionSheet = findByPropsLazy("openLazy", "hideActionSheet");

export function showSheet<T extends React.ComponentType<any>>(
    key: string,
    lazyImport: Promise<{ default: T; }> | T,
    props?: React.ComponentProps<T>
) {
    if (!("then" in lazyImport)) lazyImport = Promise.resolve({ default: lazyImport });
    actionSheet.openLazy(lazyImport, key, props ?? {});
}

export function hideSheet(key: string) {
    actionSheet.hideActionSheet(key);
}
