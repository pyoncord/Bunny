import { ButtonColors } from "@lib/utils/types";
import { findByProps } from "@metro/filters";
import InputAlert, { InputAlertProps } from "@ui/components/InputAlert";

const Alerts = findByProps("openLazy", "close");

interface InternalConfirmationAlertOptions extends Omit<ConfirmationAlertOptions, "content"> {
    content?: ConfirmationAlertOptions["content"];
    body?: ConfirmationAlertOptions["content"];
}

export interface ConfirmationAlertOptions {
    title?: string;
    content: string | JSX.Element | (string | JSX.Element)[];
    confirmText?: string;
    confirmColor?: ButtonColors;
    onConfirm: () => void;
    secondaryConfirmText?: string;
    onConfirmSecondary?: () => void;
    cancelText?: string;
    onCancel?: () => void;
    isDismissable?: boolean;
}

export function showConfirmationAlert(options: ConfirmationAlertOptions) {
    const internalOptions = options as InternalConfirmationAlertOptions;

    internalOptions.body = options.content;
    delete internalOptions.content;

    internalOptions.isDismissable ??= true;

    return Alerts.show(internalOptions);
}

export const showCustomAlert = (component: React.ComponentType<any>, props: any) => Alerts.openLazy({
    importer: async () => () => React.createElement(component, props),
});

export const showInputAlert = (options: InputAlertProps) => showCustomAlert(InputAlert, options);
