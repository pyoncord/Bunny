import { CardWrapper } from "@core/ui/components/Card";
import { useProxy } from "@lib/api/storage";
import { FontDefinition, fonts, selectFont } from "@lib/managers/fonts";
import { FormCheckbox, TableRow, TableRowGroup } from "@lib/ui/components/discord/Redesign";
import { Pressable } from "react-native";

export default function FontCard({ item: font, index }: CardWrapper<FontDefinition>) {
    useProxy(fonts);
    const selected = fonts.__selected === font.id;

    return <TableRowGroup key={index}>
        <TableRow
            label={font.name}
            subLabel={font.description}
            trailing={
                <Pressable onPress={() => selectFont(selected ? null : font.id)}>
                    <FormCheckbox checked={selected} />
                </Pressable>
            }
        />
    </TableRowGroup>;
}
