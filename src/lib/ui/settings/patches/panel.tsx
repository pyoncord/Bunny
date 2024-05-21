import { after } from "@lib/api/patcher";
import { findInReactTree } from "@lib/utils";
import { i18n, NavigationNative } from "@metro/common";
import { findByNameProxy } from "@metro/utils";
import { FormIcon, FormRow, FormSection } from "@ui/components/discord/Forms";
import { registeredSections } from "@ui/settings";

import { CustomPageRenderer, wrapOnPress } from "./shared";

function SettingsSection() {
    const navigation = NavigationNative.useNavigation();

    return <>
        {Object.keys(registeredSections).map(sect => (
            <FormSection key={sect} title={sect}>
                { /** Is usePredicate here safe? */}
                {registeredSections[sect].filter(r => r.usePredicate?.() ?? true).map(row => (
                    <FormRow
                        label={row.title()}
                        leading={<FormIcon source={row.icon} />}
                        trailing={FormRow.Arrow}
                        onPress={wrapOnPress(row.onPress, navigation, row.render, row.title())}
                    />
                ))}
            </FormSection>
        ))}
    </>;
}

export function patchPanelUI(unpatches: (() => void | boolean)[]) {
    unpatches.push(after("default", findByNameProxy("getScreens", false), (_a, screens) => ({
        ...screens,
        VendettaCustomPage: {
            title: "Bnuuy",
            render: () => <CustomPageRenderer />
        }
    })));

    const unpatch = after("default", findByNameProxy("UserSettingsOverviewWrapper", false), (_a, ret) => {
        const UserSettingsOverview = findInReactTree(ret.props.children, n => n.type?.name === "UserSettingsOverview");

        unpatches.push(after("renderSupportAndAcknowledgements", UserSettingsOverview.type.prototype, (_args, { props: { children } }) => {
            const index = children.findIndex((c: any) => c?.type?.name === "UploadLogsButton");
            if (index !== -1) children.splice(index, 1);
        }));

        unpatches.push(after("render", UserSettingsOverview.type.prototype, (_args, res) => {
            const titles = [i18n.Messages.BILLING_SETTINGS, i18n.Messages.PREMIUM_SETTINGS];

            const sections = findInReactTree(
                res.props.children,
                n => n?.children?.[1]?.type === FormSection
            ).children;

            const index = sections.findIndex((c: any) => titles.includes(c?.props.label));
            sections.splice(-~index || 4, 0, <SettingsSection />);
        }));
    }, true);

    unpatches.push(unpatch);
}

