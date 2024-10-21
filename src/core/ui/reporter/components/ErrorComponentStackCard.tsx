import { parseComponentStack } from "@core/ui/reporter/utils/parseComponentStack";
import { findAssetId } from "@lib/api/assets";
import { clipboard } from "@metro/common";
import { Button, Card, Text } from "@metro/common/components";
import { useState } from "react";
import { Image, View } from "react-native";

export default function ErrorComponentStackCard(props: {
    componentStack: string;
}) {
    const [collapsed, setCollapsed] = useState(true);

    let stack: string[];
    try {
        stack = parseComponentStack(props.componentStack);
        stack = collapsed ? stack.slice(0, 4) : stack;
    } catch {
        return;
    }

    return <Card>
        <View style={{ gap: 8 }}>
            <Text variant="heading-lg/bold">
                    Component Stack
            </Text>
            <View style={{ gap: 4 }}>
                {stack.map(component => (
                    <View style={{ flexDirection: "row" }}>
                        <Text variant="text-md/bold" color="text-muted">{"<"}</Text>
                        <Text variant="text-md/bold">{component}</Text>
                        <Text variant="text-md/bold" color="text-muted">{"/>"}</Text>
                    </View>
                ))}
            </View>
            {collapsed && <Text>...</Text>}
            <View style={{ gap: 8, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Button
                    variant="secondary"
                    text={`Show ${collapsed ? "more" : "less"}`}
                    icon={collapsed ? findAssetId("down_arrow") : <Image
                        style={{ transform: [{ rotate: `${collapsed ? 0 : 180}deg` }] }}
                        source={findAssetId("down_arrow")!}
                    />}
                    onPress={() => setCollapsed(v => !v)} />
                <Button
                    variant="secondary"
                    text="Copy"
                    icon={findAssetId("CopyIcon")}
                    onPress={() => clipboard.setString(props.componentStack)} />
            </View>
        </View>
    </Card>;
}
