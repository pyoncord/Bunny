/* eslint-disable prefer-destructuring */
import { lazyDestructure, proxyLazy } from "@lib/utils/lazy";
import { findExports } from "@metro/finders";
import { createFilterDefinition, findByDisplayNameProxy, findByNameProxy, findByProps, findByPropsProxy } from "@metro/utils";

import * as t from "./types/components";

const bySingularProp = createFilterDefinition<[string]>(
    ([prop], m) => m[prop] && Object.keys(m).length === 1,
    prop => `bunny.metro.common.components.bySingularProp(${prop})`
);

const findSingular = (prop: string) => proxyLazy(() => findExports(bySingularProp(prop))?.[prop]);
const findProp = (prop: string) => proxyLazy(() => findByProps(prop)[prop]);

// Discord
export const Alert = findByDisplayNameProxy("FluxContainer(Alert)");
export const CompatButton = findByPropsProxy("Looks", "Colors", "Sizes");
export const HelpMessage = findByNameProxy("HelpMessage");
// React Native's included SafeAreaView only adds padding on iOS.
export const SafeAreaView = proxyLazy(() => findByProps("useSafeAreaInsets").SafeAreaView);

// Buttons
export const Button = findSingular("Button") as t.Button;
export const TwinButtons = findProp("TwinButtons");
export const IconButton = findSingular("IconButton") as t.IconButton;
export const RowButton = findProp("RowButton") as t.RowButton;

export const PressableScale = findProp("PressableScale");

// Tables
export const TableRow = findProp("TableRow");
export const TableRowIcon = findProp("TableRowIcon");
export const TableRowTrailingText = findProp("TableRowTrailingText");
export const TableRowGroup = findProp("TableRowGroup");
export const TableSwitchRow = findProp("TableSwitchRow");
export const TableSwitch = findSingular("FormSwitch");
export const TableRadio = findSingular("FormRadio");
export const TableCheckbox = findSingular("FormCheckbox");

export const FormSwitch = findSingular("FormSwitch");
export const FormRadio = findSingular("FormRadio");
export const FormCheckbox = findSingular("FormCheckbox");

// Card
export const Card = findProp("Card");
export const RedesignCompat = proxyLazy(() => findByProps("RedesignCompat").RedesignCompat);

// Misc.
export const Stack = findProp("Stack") as t.Stack;

// Inputs
export const TextInput = findSingular("TextInput") as t.TextInput;

// SegmentedControl
export const SegmentedControl = findProp("SegmentedControl") as t.SegmentedControl;
export const CompatSegmentedControl = findProp("CompatSegmentedControl") as t.CompatSegmentedControl;

export const FloatingActionButton = findProp("FloatingActionButton") as t.FloatingActionButton;
export const ActionSheet = findProp("ActionSheet") as t.ActionSheet;
export const BottomSheetTitleHeader = findProp("BottomSheetTitleHeader");

const textsModule = findByPropsProxy("Text", "LegacyText");
export const Text = proxyLazy(() => textsModule.Text) as t.Text;

export const Forms = findByPropsProxy("Form", "FormSection");

export const {
    Form: LegacyForm,
    FormArrow: LegacyFormArrow,
    FormCTA: LegacyFormCTA,
    FormCTAButton: LegacyFormCTAButton,
    FormCardSection: LegacyFormCardSection,
    FormCheckbox: LegacyFormCheckbox,
    FormCheckboxRow: LegacyFormCheckboxRow,
    FormCheckmark: LegacyFormCheckmark,
    FormDivider: LegacyFormDivider,
    FormHint: LegacyFormHint,
    FormIcon: LegacyFormIcon,
    FormInput: LegacyFormInput,
    FormLabel: LegacyFormLabel,
    FormRadio: LegacyFormRadio,
    FormRadioGroup: LegacyFormRadioGroup,
    FormRadioRow: LegacyFormRadioRow,
    FormRow: LegacyFormRow,
    FormSection: LegacyFormSection,
    FormSelect: LegacyFormSelect,
    FormSliderRow: LegacyFormSliderRow,
    FormSubLabel: LegacyFormSubLabel,
    FormSwitch: LegacyFormSwitch,
    FormSwitchRow: LegacyFormSwitchRow,
    FormTernaryCheckBox: LegacyFormTernaryCheckBox,
    FormText: LegacyFormText,
    FormTitle: LegacyFormTitle
} = lazyDestructure(() => Forms);
