// This has been completely reimplemented at this point, but the disclaimer at the end of disclaimers still counts.
// https://github.com/Cordwood/Cordwood/blob/91c0b971bbf05e112927df75415df99fa105e1e7/src/lib/utils/findInTree.ts

export type SearchTree = Record<string, any>;
export type SearchFilter = (tree: SearchTree) => boolean;
export interface FindInTreeOptions {
    walkable?: string[];
    ignore?: string[];
    maxDepth?: number;
}

function treeSearch(tree: SearchTree, filter: SearchFilter, opts: Required<FindInTreeOptions>, depth: number): any {
    if (depth > opts.maxDepth) return;
    if (!tree) return;

    try {
        if (filter(tree)) return tree;
    } catch { }

    if (Array.isArray(tree)) {
        for (const item of tree) {
            if (typeof item !== "object" || item === null) continue;

            try {
                const found = treeSearch(item, filter, opts, depth + 1);
                if (found) return found;
            } catch { }
        }
    } else if (typeof tree === "object") {
        for (const key of Object.keys(tree)) {
            if (typeof tree[key] !== "object" || tree[key] === null) continue;
            if (opts.walkable.length && !opts.walkable.includes(key)) continue;
            if (opts.ignore.includes(key)) continue;

            try {
                const found = treeSearch(tree[key], filter, opts, depth + 1);
                if (found) return found;
            } catch { }
        }
    }
}

export default function findInTree(
    tree: SearchTree,
    filter: SearchFilter,
    {
        walkable = [],
        ignore = [],
        maxDepth = 100
    }: FindInTreeOptions = {},
): any | undefined {
    return treeSearch(tree, filter, { walkable, ignore, maxDepth }, 0);
}
