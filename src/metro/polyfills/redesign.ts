import { getMetroCache, registerPolyfillCacheId } from "@metro/caches";
import { getModules, requireModule } from "@metro/modules";
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

const redesignPropSource = {} as Record<Keys, any>;
const redesignModule = {} as Record<Keys, any>;

const cache = getMetroCache().polyfillCache.redesign_module;
for (const id in cache ?? getModules(null)) {
    const moduleExports = requireModule(id);
    polyfillRedesignModule(moduleExports, Number(id));
}

function polyfillRedesignModule(moduleExports: any, id: number) {
    const propMap = new Map<string, string | null>();

    for (const prop of redesignProps) {
        if (moduleExports?.[prop]) {
            registerPolyfillCacheId("redesign_module", id);
            propMap.set(prop, null);
        } else if (moduleExports?.default?.[prop]) {
            registerPolyfillCacheId("redesign_module", id);
            propMap.set(prop, "default");
        }
    }

    for (const [prop, defaultKey] of propMap) {
        const exportsForProp = defaultKey ? moduleExports[defaultKey] : moduleExports;

        if (redesignModule[prop]) {
            if (Object.keys(exportsForProp).length < Object.keys(redesignPropSource[prop]).length) {
                redesignModule[prop] = exportsForProp[prop];
                redesignPropSource[prop] = exportsForProp;
            }
        } else {
            redesignModule[prop] = exportsForProp[prop];
            redesignPropSource[prop] = exportsForProp;
        }
    }
}

export default redesignModule;
