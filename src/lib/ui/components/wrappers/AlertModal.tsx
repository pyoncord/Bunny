import { lazyDestructure } from "@lib/utils/lazy";
import { findByProps } from "@metro";
import { Text } from "@metro/common/components";
import { Button } from "@metro/common/types/components";
import { ComponentProps, ComponentType, ReactNode } from "react";
import { useWindowDimensions, View } from "react-native";

const {
    AlertModal: _AlertModal,
    AlertActionButton: _AlertActionButton
} = lazyDestructure(() => findByProps("AlertModal", "AlertActions"));

type ActionButtonProps = Omit<ComponentProps<Button>, "onPress"> & {
    onPress?: () => void | Promise<unknown>;
};

export const AlertActionButton = _AlertActionButton as ComponentType<ActionButtonProps>;

export default function AlertModal(props: Record<string, unknown>) {
    const { width: windowWidth } = useWindowDimensions();

    // ponyfill for extraContent
    if ("extraContent" in props) {
        props.content = (
            <View
                style={{
                    /* HACK: the contents are drawn over the padding for some reason, so we set the max width */
                    maxWidth: windowWidth - 70,
                    flexShrink: 1, // has no effect but we'll keep it
                    gap: 16
                }}>
                <Text variant="text-md/medium" color="text-muted">
                    {props.content as string}
                </Text>
                <View>
                    {props.extraContent as ReactNode}
                </View>
            </View>
        );

        delete props.extraContent;
    }

    return <_AlertModal {...props} />;
}
