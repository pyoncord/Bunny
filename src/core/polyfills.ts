//! Starting from 202.4, Promise.allSettled may be undefined due to conflicting then/promise versions, so we use our own.
const allSettledFulfill = <T>(value: T) => ({ status: "fulfilled", value });
const allSettledReject = <T>(reason: T) => ({ status: "rejected", reason });
const mapAllSettled = <T>(item: T) => Promise.resolve(item).then(allSettledFulfill, allSettledReject);
export const allSettled = <T extends unknown[]>(iterator: T) => Promise.all(Array.from(iterator).map(mapAllSettled));

// @ts-ignore
Promise.allSettled ??= allSettled;
