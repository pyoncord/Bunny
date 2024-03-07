import { Strings } from "@core/i18n";
import { React } from "@metro/common";
import { Codeblock } from "@ui/components";
import { Button } from "@ui/components/discord";
import { FormText } from "@ui/components/discord/Forms";
import { createThemedStyleSheet } from "@ui/styles";
import { ScrollView } from "react-native";

interface ErrorBoundaryState {
    hasErr: boolean;
    errText?: string;
}

export interface ErrorBoundaryProps {
    children: JSX.Element | JSX.Element[];
}

const styles = createThemedStyleSheet({
    view: {
        flex: 1,
        flexDirection: "column",
        margin: 10,
    },
    title: {
        fontSize: 20,
        textAlign: "center",
        marginBottom: 5,
    },
});

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasErr: false };
    }

    static getDerivedStateFromError = (error: Error) => ({ hasErr: true, errText: error.message });

    render() {
        if (!this.state.hasErr) return this.props.children;

        return (
            <ScrollView style={styles.view}>
                <FormText style={styles.title}>{Strings.UH_OH}</FormText>
                <Codeblock selectable style={{ marginBottom: 5 }}>{this.state.errText}</Codeblock>
                <Button
                    color={Button.Colors.RED}
                    size={Button.Sizes.MEDIUM}
                    look={Button.Looks.FILLED}
                    onPress={() => this.setState({ hasErr: false, errText: undefined })}
                    text={Strings.RETRY}
                />
            </ScrollView>
        );
    }
}
