import { _colorRef } from "@lib/addons/themes/colors/updater";
import { after } from "@lib/api/patcher";
import { findInReactTree } from "@lib/utils";
import { lazyDestructure } from "@lib/utils/lazy";
import { findByNameLazy, findByProps } from "@metro";
import chroma from "chroma-js";
import { ImageBackground } from "react-native";

const MessagesWrapperConnected = findByNameLazy("MessagesWrapperConnected", false);
const { MessagesWrapper } = lazyDestructure(() => findByProps("MessagesWrapper"));

export default function patchChatBackground() {
    const patches = [
        after("default", MessagesWrapperConnected, (_, ret) => {
            // TODO: support custom preferences
            // useObservable([ColorManager.preferences]);
            // if (!_colorRef.current || ColorManager.preferences.customBackground === "hidden") return ret;

            if (!_colorRef.current || !_colorRef.current.background?.url) return ret;

            return <ImageBackground
                style={{ flex: 1, height: "100%" }}
                source={_colorRef.current.background?.url && { uri: _colorRef.current.background.url } || 0}
                blurRadius={typeof _colorRef.current.background?.blur === "number" ? _colorRef.current.background?.blur : 0}
            >
                {ret}
            </ImageBackground>;
        }
        ),
        after("render", MessagesWrapper.prototype, (_, ret) => {
            if (!_colorRef.current || !_colorRef.current.background?.url) return;
            const messagesComponent = findInReactTree(
                ret,
                x => x && "HACK_fixModalInteraction" in x.props && x?.props?.style
            );

            if (messagesComponent) {
                const backgroundColor = chroma(
                    messagesComponent.props.style.backgroundColor || "black"
                ).alpha(
                    1 - (_colorRef.current.background?.opacity ?? 1)
                );

                messagesComponent.props.style = [
                    messagesComponent.props.style,
                    { backgroundColor }
                ];
            }
        })
    ];

    return () => patches.forEach(x => x());
}
