import { findByPropsProxy } from "@metro/utils";

const actionSheet = findByPropsProxy("openLazy", "hideActionSheet");

export function showSheet<T extends React.ComponentType<any>>(
    key: string,
    lazyImport: Promise<{ default: T; }>,
    props?: React.ComponentProps<T>
) {
    actionSheet.openLazy(lazyImport, key, props ?? {});
}

export function hideSheet(key: string) {
    actionSheet.hideActionSheet(key);
}
