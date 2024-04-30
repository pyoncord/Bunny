import * as fs from "@lib/api/native/fs";
import { useEffect, useMemo, useState } from "react";

export enum CheckState {
    FALSE,
    TRUE,
    LOADING,
    ERROR
}

export function useFileExists(path: string, prefix?: string): [CheckState, typeof fs] {
    const [state, setState] = useState<CheckState>(CheckState.LOADING);

    const check = () => fs.fileExists(path, prefix)
        .then(exists => setState(exists ? CheckState.TRUE : CheckState.FALSE))
        .catch(() => setState(CheckState.ERROR));

    const customFS = useMemo(() => new Proxy(fs, {
        get(target, p, receiver) {
            const val = Reflect.get(target, p, receiver);
            if (typeof val !== "function") return;

            return (...args: any[]) => {
                const promise = (check(), val(...args));
                if (promise?.constructor?.name === "Promise") {
                    setState(CheckState.LOADING);
                    promise.finally(check);
                }
                return promise;
            };
        },
    }), []);

    useEffect(() => void check(), []);
    return [state, customFS];
}
