import AssetDisplay from "@core/ui/components/AssetDisplay";
import { all } from "@lib/api/assets";
import { FormDivider } from "@lib/ui/components/discord/Forms";
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
                    data={Object.values(all).filter(a => a.name.includes(search) || a.id.toString() === search)}
                    renderItem={({ item }) => <AssetDisplay asset={item} />}
                    ItemSeparatorComponent={FormDivider}
                    keyExtractor={item => item.name}
                />
            </View>
        </ErrorBoundary>
    );
}
