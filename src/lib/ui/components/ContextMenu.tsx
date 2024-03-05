import { instead } from "@lib/api/patcher";
import { ReactNative } from "@lib/metro/common";
import { findByProps } from "@lib/metro/filters";

const { ContextMenu: _ContextMenu } = findByProps("ContextMenu");
const { AccessibilityInfo } = ReactNative;

type ContextMenuItem = {
    label: string,
    iconSource: import("react-native").ImageSourcePropType,
    action: () => unknown,
    [key: string]: any;
};

type ContextMenuProps = {
    triggerOnLongPress: boolean;
    items: ContextMenuItem[] | ContextMenuItem[][];
    align: "left" | "right" | "above" | "below" | "auto" | null;
    title: string;
    children: React.FC;
    [key: string]: any;
};

export default function ContextMenu(props: ContextMenuProps) {
    const ref = React.useRef(null);

    React.useEffect(() => {
        // hacky discord fix for android where pressing back with context menu open crashes the client
        if (ReactNative.Platform.OS !== "android") return;

        // @ts-ignore
        const ctxMenuReactTag = ref.current?._children?.[0]?._nativeTag;

        return () => {
            if (!ctxMenuReactTag) return;

            const unpatch = instead("setAccessibilityFocus", AccessibilityInfo, ([tag], orig) => {
                if (tag !== ctxMenuReactTag) {
                    return orig.apply(AccessibilityInfo, [tag]);
                } else {
                    unpatch(); // and skip this call
                }
            });
        };
    }, []);

    return <ReactNative.View ref={ref}>
        <_ContextMenu
            {...props}
        />
    </ReactNative.View>;
}
