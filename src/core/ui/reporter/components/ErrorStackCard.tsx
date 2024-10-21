import parseErrorStack, { StackFrame } from "@core/ui/reporter/utils/parseErrorStack";
import { findAssetId } from "@lib/api/assets";
import { clipboard, constants } from "@metro/common";
import { Button, Card, Text } from "@metro/common/components";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";

import { INDEX_BUNDLE_FILE } from "./ErrorCard";

export default function ErrorStackCard(props: {
    error: Error & { stack: string };
}) {
    const [collapsed, setCollapsed] = useState(true);

    let stack: StackFrame[];

    try {
        const parsedErrorStack = parseErrorStack(props.error.stack);
        stack = collapsed ? parsedErrorStack.slice(0, 4) : parsedErrorStack;
    } catch {
        return null;
    }

    return <Card>
        <View style={{ gap: 12 }}>
            <Text variant="heading-lg/bold">
                Call Stack
            </Text>
            <View style={{ gap: 4 }}>
                {stack.map((f, id) => <Line id={id} frame={f} />)}
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
                    onPress={() => clipboard.setString(props.error.stack)} />
            </View>
        </View>
    </Card>;
}
function Line(props: { id: number, frame: StackFrame }) {
    const [collapsed, setCollapsed] = useState(true);

    return <Pressable onPress={() => setCollapsed(v => !v)} key={props.id}>
        <Text style={{ fontFamily: constants.Fonts.CODE_BOLD }}>
            {props.frame.methodName}
        </Text>
        <Text style={{ fontFamily: constants.Fonts.CODE_NORMAL }} ellipsizeMode="middle" numberOfLines={collapsed ? 1 : undefined}>
            <Text color="text-muted">{props.frame.file === INDEX_BUNDLE_FILE ? "jsbundle" : props.frame.file}:{props.frame.lineNumber}:{props.frame.column}</Text>
        </Text>
    </Pressable>;
}

