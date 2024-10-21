import { hasStack, isComponentStack } from "@core/ui/reporter/utils/isStack";
import { Codeblock } from "@lib/ui/components";
import { ActionSheet, Text } from "@metro/common/components";
import { View } from "react-native";

import ErrorComponentStackCard from "./ErrorComponentStackCard";
import ErrorStackCard from "./ErrorStackCard";

export default function ErrorDetailsActionSheet(props: {
    error: Error;
}) {
    return <ActionSheet>
        <View style={{ gap: 12, paddingVertical: 12 }}>
            <Text variant="heading-lg/extrabold">Error</Text>
            <Codeblock selectable={true}>{props.error.message}</Codeblock>
            {hasStack(props.error) && <ErrorStackCard error={props.error} />}
            {isComponentStack(props.error) ? <ErrorComponentStackCard componentStack={props.error.componentStack} /> : null}
        </View>
    </ActionSheet>;
}
