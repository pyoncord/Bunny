/**
 * `invariant` is used to [assert](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions) that the `condition` is [truthy](https://github.com/getify/You-Dont-Know-JS/blob/bdbe570600d4e1107d0b131787903ca1c9ec8140/up%20%26%20going/ch2.md#truthy--falsy).
 * 💥 `invariant` will `throw` an `Error` if the `condition` is [falsey](https://github.com/getify/You-Dont-Know-JS/blob/bdbe570600d4e1107d0b131787903ca1c9ec8140/up%20%26%20going/ch2.md#truthy--falsy)
 * 🤏 `message`s are not displayed in production environments to help keep bundles small
 *
 * ```ts
 * const value: Person | null = { name: "Alex" };
 * invariant(value, "Expected value to be a person");
 * // type of `value`` has been narrowed to `Person`
 * ```
 */
export default function invariant(
    condition: any,
    message?: string | (() => string),
): asserts condition {
    if (condition) return;

    const resolvedMessage: string | undefined = typeof message === "function" ? message() : message;
    const prefix = "[Invariant Violation]";
    const value = resolvedMessage ? `${prefix}: ${resolvedMessage}` : prefix;

    throw new Error(value);
}
