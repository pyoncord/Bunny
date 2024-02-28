import { ButtonColors } from "@/lib/utils/types";
import { findByProps } from "@metro/filters";
import { Forms, Alert } from "@ui/components";

const { FormInput } = Forms;
const Alerts = findByProps("openLazy", "close");

export interface InputAlertProps {
    title?: string;
    confirmText?: string;
    confirmColor?: ButtonColors;
    onConfirm: (input: string) => (void | Promise<void>);
    cancelText?: string;
    placeholder?: string;
    initialValue?: string;
    secureTextEntry?: boolean;
}

export default function InputAlert({ title, confirmText, confirmColor, onConfirm, cancelText, placeholder, initialValue = "", secureTextEntry }: InputAlertProps) {
    const [value, setValue] = React.useState(initialValue);
    const [error, setError] = React.useState("");

    function onConfirmWrapper() {
        const asyncOnConfirm = Promise.resolve(onConfirm(value))

        asyncOnConfirm.then(() => {
            Alerts.close();
        }).catch((e: Error) => {
            setError(e.message);
        });
    };

    return (
        <Alert
            title={title}
            confirmText={confirmText}
            confirmColor={confirmColor}
            isConfirmButtonDisabled={error.length !== 0}
            onConfirm={onConfirmWrapper}
            cancelText={cancelText}
            onCancel={() => Alerts.close()}
        >
            <FormInput
                placeholder={placeholder}
                value={value}
                onChange={(v: string | { text: string }) => {
                    setValue(typeof v === "string" ? v : v.text);
                    if (error) setError("");
                }}
                returnKeyType="done"
                onSubmitEditing={onConfirmWrapper}
                error={error || undefined}
                secureTextEntry={secureTextEntry}
                autoFocus={true}
                showBorder={true}
                style={{ alignSelf: "stretch" }}
            />
        </Alert>
    );
};