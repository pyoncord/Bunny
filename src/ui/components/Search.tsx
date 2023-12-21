import { SearchProps } from "@types";
import { ReactNative as RN } from "@metro/common";
import { findByProps } from "@metro/filters";
import ErrorBoundary from "@ui/components/ErrorBoundary";
import { getAssetIDByName } from "@ui/assets";

const { FormIcon } = findByProps("FormIcon");
const { TextInput } = findByProps("TableRow");

const props = {
    "placeholder": "Search",
    "returnKeyType": "search",
    "size": "md",
    "onFocus": "ƒ () {}",
    "value": "",
    "grow": true,
    "autoCorrect": false,
    "autoCapitalize": "none",
    "accessibilityRole": "search",
    "leadingIcon": "ƒ () {}",
    "isClearable": true,
    "onChangeText": "ƒ () {}",
    "editable": true,
    "onBlur": "ƒ () {}",
    "style": [
        "{padding: 12, paddingTop: 12}",
        "{color: \"#e4e5e8\", fontFamily: \"ggsans-Medium, Noto…}",
        "{paddingEnd: undefined, paddingStart: 36.3636360168…}",
        "{padding: 12, paddingTop: 12}",
        "{color: \"#e4e5e8\", fontFamily: \"ggsans-Medium, Noto…}",
        "{paddingEnd: undefined, paddingStart: 36.3636360168…}"
    ],
    "placeholderTextColor": "#828391"
};

function SearchIcon() {
    return <RN.Image style={{ transform: [{ scale: 0.8 }]}} source={getAssetIDByName("search")} />
}
export default ({ onChangeText, placeholder, style }: SearchProps) => {
    const [query, setQuery] = React.useState("");
    
    const onChange = (value: string) => {
        setQuery(value);
        onChangeText?.(value);
    }

    return <ErrorBoundary>
        <RN.View style={style}>
            <TextInput isClearable grow
                leadingIcon={SearchIcon}
                placeholder={placeholder ?? "Search"}
                onChange={onChange}
                returnKeyType={"search"}
                size="md"
                autoCapitalize="none"
                autoCorrect={false}
                value={query}
            />
        </RN.View>
    </ErrorBoundary>
};