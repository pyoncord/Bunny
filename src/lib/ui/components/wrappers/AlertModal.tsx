import { lazyDestructure } from "@lib/utils/lazy";
import { findByFilePath, findByProps } from "@metro";
import { Text } from "@metro/common/components";
import { Button } from "@metro/common/types/components";
import { ComponentProps, ComponentType, ReactNode } from "react";
import { View } from "react-native";

type ActionButtonProps = Omit<ComponentProps<Button>, "onPress"> & {
    onPress?: () => void | Promise<unknown>;
};

const {
    AlertModal: _AlertModal,
    AlertActionButton: _AlertActionButton
} = lazyDestructure(() => findByProps("AlertModal", "AlertActions"));

export const AlertActionButton = _AlertActionButton as ComponentType<ActionButtonProps>;

export default function AlertModal(props: Record<string, unknown>) {
    const forwardFailedModal = findByFilePath("modules/forwarding/native/ForwardFailedAlertModal.tsx");

    // ponyfill for extraContent
    if (!forwardFailedModal && "extraContent" in props) {
        props.content = (
            <View style={{ gap: 16 }}>
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
