export function parseComponentStack(componentStack: string) {
    return componentStack.split(/[\s|\n]+?in /).filter(Boolean);
}
