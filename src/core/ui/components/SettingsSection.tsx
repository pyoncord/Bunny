import { Strings } from "@core/i18n";
import { getScreens } from "@core/ui/settings/data";
import { getAssetIDByName } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { settings } from "@lib/settings";
import { NavigationNative } from "@metro/common";
import { ErrorBoundary, Forms } from "@ui/components";

const { FormRow, FormSection, FormDivider } = Forms;

export default function SettingsSection() {
    const navigation = NavigationNative.useNavigation();
    useProxy(settings);

    const screens = getScreens();

    return (
        <ErrorBoundary>
            <FormSection key="Vendetta" title={`${Strings.BUNNY}${settings.safeMode?.enabled ? ` (${Strings.SAFE_MODE})` : ""}`}>
                {screens.filter(s => (s.shouldRender?.() ?? true)).map((s, i) => (
                    <>
                        <FormRow
                            label={s.title}
                            leading={<FormRow.Icon source={getAssetIDByName(s.icon!)} />}
                            trailing={FormRow.Arrow}
                            onPress={() => navigation.push(s.key)}
                        />
                        {i !== screens.length - 1 && <FormDivider />}
                    </>
                ))}
            </FormSection>
        </ErrorBoundary>
    );
}
