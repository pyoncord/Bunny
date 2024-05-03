import { CardWrapper } from "@core/ui/components/Card";
import { getAssetIDByName } from "@lib/api/assets";
import { useProxy } from "@lib/api/storage";
import { FontDefinition, fonts, removeFont, selectFont } from "@lib/managers/fonts";
import { FormCheckbox, IconButton, TableRow, TableRowGroup } from "@lib/ui/components/discord/Redesign";
import { useContext } from "react";
import { Pressable } from "react-native";

import { RemoveModeContext } from "./AddonPage";

export default function FontCard({ item: font, index }: CardWrapper<FontDefinition>) {
    useProxy(fonts);

    const removeMode = useContext(RemoveModeContext);
    const selected = fonts.__selected === font.__source;

    return <TableRowGroup key={index}>
        <TableRow
            label={font.name}
            subLabel={font.description}
            trailing={
                <Pressable onPress={() => selectFont(selected ? null : font.__source)}>
                    {!removeMode ? <FormCheckbox checked={selected} /> : <IconButton
                        size="sm"
                        variant="secondary"
                        icon={getAssetIDByName("TrashIcon")}
                        onPress={() => removeFont(font.__source)}
                    />}
                </Pressable>
            }
        />
    </TableRowGroup>;
}
