import { getPolyfillModuleCacher } from "@metro/internals/caches";
import { LiteralUnion } from "type-fest";

const redesignProps = new Set([
    "AlertActionButton",
    "AlertModal",
    "AlertModalContainer",
    "AvatarDuoPile",
    "AvatarPile",
    "BACKDROP_OPAQUE_MAX_OPACITY",
    "Backdrop",
    "Button",
    "Card",
    "ContextMenu",
    "ContextMenuContainer",
    "FauxHeader",
    "FloatingActionButton",
    "GhostInput",
    "GuildIconPile",
    "HeaderActionButton",
    "HeaderButton",
    "HeaderSubmittingIndicator",
    "IconButton",
    "Input",
    "InputButton",
    "InputContainer",
    "LayerContext",
    "LayerScope",
    "Modal",
    "ModalActionButton",
    "ModalContent",
    "ModalDisclaimer",
    "ModalFloatingAction",
    "ModalFloatingActionSpacer",
    "ModalFooter",
    "ModalScreen",
    "ModalStepIndicator",
    "NAV_BAR_HEIGHT",
    "NAV_BAR_HEIGHT_MULTILINE",
    "Navigator",
    "NavigatorHeader",
    "NavigatorScreen",
    "Pile",
    "PileOverflow",
    "RedesignCompat",
    "RedesignCompatContext",
    "RowButton",
    "STATUS_BAR_HEIGHT",
    "SceneLoadingIndicator",
    "SearchField",
    "SegmentedControl",
    "SegmentedControlPages",
    "Slider",
    "Stack",
    "StepModal",
    "StickyContext",
    "StickyHeader",
    "StickyWrapper",
    "TABLE_ROW_CONTENT_HEIGHT",
    "TABLE_ROW_HEIGHT",
    "TableCheckboxRow",
    "TableRadioGroup",
    "TableRadioRow",
    "TableRow",
    "TableRowGroup",
    "TableRowGroupTitle",
    "TableRowIcon",
    "TableSwitchRow",
    "Tabs",
    "TextArea",
    "TextField",
    "TextInput",
    "Toast",
    "dismissAlerts",
    "getHeaderBackButton",
    "getHeaderCloseButton",
    "getHeaderConditionalBackButton",
    "getHeaderNoTitle",
    "getHeaderTextButton",
    "hideContextMenu",
    "navigatorShouldCrossfade",
    "openAlert",
    "useAccessibilityNativeStackOptions",
    "useAndroidNavScrim",
    "useCoachmark",
    "useFloatingActionButtonScroll",
    "useFloatingActionButtonState",
    "useNativeStackNavigation",
    "useNavigation",
    "useNavigationTheme",
    "useNavigatorBackPressHandler",
    "useNavigatorScreens",
    "useNavigatorShouldCrossfade",
    "useSegmentedControlState",
    "useStackNavigation",
    "useTabNavigation",
    "useTooltip"
] as const);

type Keys = LiteralUnion<typeof redesignProps extends Set<infer U> ? U : string, string>;

const _module = {} as Record<Keys, any>;
const _source = {} as Record<Keys, number>;

const cacher = getPolyfillModuleCacher("redesign_module");

for (const [id, moduleExports] of cacher.getModules()) {
    for (const prop of redesignProps) {
        let actualExports: any;

        if (moduleExports[prop]) {
            actualExports = moduleExports;
        } else if (moduleExports.default?.[prop]) {
            actualExports = moduleExports.default;
        } else {
            continue;
        }

        const exportsKeysLength = Reflect.ownKeys(actualExports).length;
        if (_source[prop] && exportsKeysLength >= _source[prop]) {
            continue;
        }

        _module[prop] = actualExports[prop];
        _source[prop] = Reflect.ownKeys(actualExports).length;
        cacher.cacheId(id);

        if (exportsKeysLength === 1) {
            redesignProps.delete(prop);
        }
    }
}

cacher.finish();

export default _module;
