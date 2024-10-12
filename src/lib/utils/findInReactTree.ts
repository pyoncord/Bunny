import { findInTree } from "@lib/utils";
import { SearchFilter } from "@lib/utils/findInTree";

export default function findInReactTree(tree: { [key: string]: any; }, filter: SearchFilter): any {
    return findInTree(tree, filter, {
        walkable: ["props", "children", "child", "sibling"],
    });
}
