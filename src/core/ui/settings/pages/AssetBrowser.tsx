import AssetDisplay from "@core/ui/components/AssetDisplay";
import { assetsMap } from "@lib/api/assets";
import { LegacyFormDivider } from "@metro/common/components";
import { ErrorBoundary, Search } from "@ui/components";
import { FlatList, View } from "react-native";

export default function AssetBrowser() {
    const [search, setSearch] = React.useState("");

    return (
        <ErrorBoundary>
            <View style={{ flex: 1 }}>
                <Search
                    style={{ margin: 10 }}
                    onChangeText={(v: string) => setSearch(v)}
                />
                <FlatList
                    data={Object.values(assetsMap).filter(a => a.name.includes(search) || a.id.toString() === search)}
                    renderItem={({ item }) => <AssetDisplay asset={item} />}
                    ItemSeparatorComponent={LegacyFormDivider}
                    keyExtractor={item => item.name}
                />
            </View>
        </ErrorBoundary>
    );
}
