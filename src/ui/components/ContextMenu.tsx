import { findByProps } from "@/lib/metro/filters";

const { ContextMenu } = findByProps("ContextMenu");

export default ContextMenu as (props: {
    triggerOnLongPress: boolean;
    items: Array<{ 
        label: string, 
        iconSource: number, 
        action: () => unknown,
        [key: string]: any;
    }>;
    align: "left" | "right" | "above" | "below" | "auto" | null;
    title: string;
    children: React.FC;
    [key: string]: any;
}) => JSX.Element;