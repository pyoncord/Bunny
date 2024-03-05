import { findInTree } from "@lib/utils";
import { SearchFilter } from "@lib/utils/findInTree";

export const findInReactTree = (tree: { [key: string]: any; }, filter: SearchFilter): any => findInTree(tree, filter, {
    walkable: ["props", "children", "child", "sibling"],
});
