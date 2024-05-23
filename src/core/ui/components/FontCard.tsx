import { Strings } from "@core/i18n";
import { CardWrapper } from "@core/ui/components/Card";
import { requireAssetIndex } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { FontDefinition, fonts, removeFont, selectFont } from "@lib/managers/fonts";
import { FormCheckbox, IconButton, TableRow, TableRowGroup } from "@metro/common/components";
import { showToast } from "@ui/toasts";
import { useContext } from "react";
import { Pressable, View } from "react-native";

import { RemoveModeContext } from "./AddonPage";

export default function FontCard({ item: font, index }: CardWrapper<FontDefinition>) {
    useProxy(fonts);

    const removeMode = useContext(RemoveModeContext);
    const selected = fonts.__selected === font.name;

    return <View key={index} style={{ marginVertical: 4 }}>
        <TableRowGroup>
            <TableRow
                label={font.name}
                trailing={
                    <Pressable onPress={() => {
                        selectFont(selected ? null : font.name).then(() => {
                            showToast(Strings.RESTART_REQUIRED_TO_TAKE_EFFECT, requireAssetIndex("WarningIcon"));
                        });
                    }}>
                        {!removeMode ? <FormCheckbox checked={selected} /> : <IconButton
                            size="sm"
                            variant="secondary"
                            icon={requireAssetIndex("TrashIcon")}
                            onPress={() => removeFont(font.name)}
                        />}
                    </Pressable>
                }
            />
        </TableRowGroup>
    </View>;
}
