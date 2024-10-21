export function isComponentStack(error: Error): error is Error & { componentStack: string; } {
    return "componentStack" in error && typeof error.componentStack === "string";
}
export function hasStack(error: Error): error is Error & { stack: string; } {
    return !!error.stack;
}
