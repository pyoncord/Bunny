const allSettledFulfill = <T>(value: T) => ({ status: "fulfilled", value } as const);
const allSettledReject = <T>(reason: T) => ({ status: "rejected", reason } as const);
const mapAllSettled = <T>(item: T) => Promise.resolve(item).then(allSettledFulfill, allSettledReject);

Promise.allSettled ??= <T extends unknown[]>(iterator: T) => {
    return Promise.all(Array.from(iterator).map(mapAllSettled));
};
