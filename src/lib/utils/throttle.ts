/**
 * Returns a function that ensures that only one call
 * executes every given milliseconds.
 * @param funct Function to throttle
 * @param time Time to wait before allowing the next call
 * @returns Throttled function with the same signature as `funct`
 */
export function throttle<T extends (...args: any[]) => any>(
    funct: T,
    time: number = 200
): T {
    let active = false;
    let calledWhileActive = false;
    return function (this: ReturnType<T>, ...args: Parameters<T>) {
        if (!active) {
            active = true;
            funct.apply(this, args);
            setTimeout(() => {
                active = false;
                if (calledWhileActive) {
                    calledWhileActive = false;
                    funct.apply(this, args);
                }
            }, time);
        } else {
            calledWhileActive = true;
        }
    } as T;
}
