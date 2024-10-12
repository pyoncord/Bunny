// A really basic fetch wrapper which throws on non-ok response codes
export default async function safeFetch(input: RequestInfo | URL, options?: RequestInit, timeout = 10000) {
    const req = await fetch(input, {
        signal: timeoutSignal(timeout),
        ...options
    });

    if (!req.ok) throw new Error(`Request returned non-ok: ${req.status} ${req.statusText}`);
    return req;
}

function timeoutSignal(ms: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(`Timed out after ${ms}ms`), ms);
    return controller.signal;
}
