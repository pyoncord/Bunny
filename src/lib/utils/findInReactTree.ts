import { findInTree } from "@lib/utils";
import { SearchFilter } from "./findInTree";

export default (tree: { [key: string]: any }, filter: SearchFilter): any => findInTree(tree, filter, {
    walkable: ["props", "children", "child", "sibling"],
});