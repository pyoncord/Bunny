import { DiscordTextStyles } from "@ui/types";
import { MutableRefObject, ReactNode, RefObject } from "react";
import type * as RN from "react-native";
import { ImageSourcePropType, PressableProps } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { LiteralUnion } from "type-fest";

// Abandon all hope, ye who enter here
type Style = RN.ViewStyle & RN.ImageStyle & RN.TextStyle;

type InteractiveSize = "sm" | "md" | "lg";

// Buttons
type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "active";

interface ButtonProps {
    disabled?: boolean;
    onPress: () => void;
    loading?: boolean;
    variant?: LiteralUnion<ButtonVariant, string>;
    text?: string;
    size?: LiteralUnion<InteractiveSize, string>;
    iconPosition?: "start" | "end";
    scaleAmountInPx?: number;
    icon?: ImageSourcePropType | ReactNode;
    style?: Style;
    grow?: boolean;
}

export type Button = React.ForwardRefExoticComponent<ButtonProps>;

// Segmented Control
interface SegmentedControlItem {
    id: string;
    label: string;
    page?: JSX.Element | null;
}

export interface SegmentedControlStateArgs {
    items: SegmentedControlItem[];
    pageWidth: number;
    defaultIndex?: number;
}

export interface SegmentedControlState {
    activeIndex: SharedValue<number>;
    pagerRef: RefObject<unknown>;
    scrollTarget: SharedValue<number>;
    scrollOverflow: SharedValue<number>;
    scrollOffset: SharedValue<number>;
    items: SegmentedControlItem[];
    itemDimensions: SharedValue<unknown[]>;
    pageWidth: number;
    pressedIndex: SharedValue<number>;
    onPageChangeRef: MutableRefObject<unknown>; // { current: undefined }
    setActiveIndex: (index: number) => void;
    setItemDimensions: (index: number, dimensions: unknown[]) => void;
    useReducedMotion: boolean;
}

interface SegmentedControlProps {
    state: SegmentedControlState;
    variant?: string;
}

export type SegmentedControl = React.FC<SegmentedControlProps>;

interface SegmentedControlPagesProps {
    state: SegmentedControlState;
}

export type SegmentedControlPages = React.FC<SegmentedControlPagesProps>;

interface CompatSegmentedControlProps {
    values: string[];
    selectedSegmentIndex?: number;
    onValueChange?: (index: number) => void;
    onSetActiveIndex?: (index: number) => void;
}

export type CompatSegmentedControl = React.FC<CompatSegmentedControlProps>;

// TODO: Confirm if this is real
interface TextInputProps extends Omit<RN.TextInputProps, "onChange" | "onChangeText" | "value"> {
    defaultValue?: string;
    description?: string;
    editable?: boolean;
    errorMessage?: string;
    focusable?: boolean;
    grow?: boolean;
    isCentered?: boolean;
    isClearable?: boolean;
    isDisabled?: boolean;
    isRound?: boolean;
    label?: string;
    leadingIcon?: React.FC<any>;
    leadingPressableProps?: PressableProps;
    leadingText?: string;
    onChange?: (text: string) => void;
    size?: "sm" | "md" | "lg";
    state?: "error" | "default";
    style?: Style;
    trailingIcon?: React.FC<any>;
    trailingPressableProps?: PressableProps;
    trailingText?: string;
    value?: string | RN.Falsy;
}

export type TextInput = React.FC<TextInputProps>;

interface RowButtonProps {
    variant?: LiteralUnion<ButtonVariant, string>;
    style?: Style;
    icon?: ImageSourcePropType | ReactNode;
    label: string | ReactNode;
    subLabel?: string | ReactNode;
    onPress: () => void;
    disabled?: boolean;
}

export type RowButton = React.FC<RowButtonProps>;

interface StackProps {
    /** defaults to vertical */
    direction?: "vertical" | "horizontal";
    /** defaults to 8 */
    spacing?: number;
}

export type Stack = React.FC<React.PropsWithChildren<StackProps> & RN.ViewProps>;

interface FABProps {
    icon: ImageSourcePropType | ReactNode;
    style?: Style;
    onPress: () => void;
}

export type FloatingActionButton = React.FC<FABProps>;

interface ActionSheetProps {
    scrollable?: boolean;
}

export type ActionSheet = React.FC<React.PropsWithChildren<ActionSheetProps>>;

type TextProps = React.ComponentProps<typeof RN.Text> & {
    variant?: DiscordTextStyles;
    color?: string; // TODO: type this
    lineClamp?: number;
    maxFontSizeMultiplier?: number;
    style?: RN.TextStyle;
};

export type Text = React.FC<TextProps>;

interface IconButtonProps {
    icon: ImageSourcePropType | ReactNode;
    onPress: () => void;
    disabled?: boolean;
    size?: InteractiveSize;
    variant?: ButtonVariant;
    style?: Style;
}

export type IconButton = React.FC<IconButtonProps>;
