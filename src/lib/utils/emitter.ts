export enum Events {
    GET = "GET",
    SET = "SET",
    DEL = "DEL",
}

export type EmitterEvent = "SET" | "GET" | "DEL";

export interface EmitterListenerData {
    path: string[];
    value?: any;
}

export type EmitterListener = (
    event: EmitterEvent,
    data: EmitterListenerData | any
) => any;

export type EmitterListeners = Record<string, Set<EmitterListener>>

export interface Emitter {
    listeners: EmitterListeners;
    on: (event: EmitterEvent, listener: EmitterListener) => void;
    off: (event: EmitterEvent, listener: EmitterListener) => void;
    once: (event: EmitterEvent, listener: EmitterListener) => void;
    emit: (event: EmitterEvent, data: EmitterListenerData) => void;
}

export function createEmitter(): Emitter {
    return {
        listeners: Object.values(Events).reduce<EmitterListeners>((acc, val: string) => ((acc[val] = new Set<EmitterListener>()), acc), {}) as EmitterListeners,

        on(event: EmitterEvent, listener: EmitterListener) {
            if (!this.listeners[event].has(listener)) this.listeners[event].add(listener);
        },

        off(event: EmitterEvent, listener: EmitterListener) {
            this.listeners[event].delete(listener);
        },

        once(event: EmitterEvent, listener: EmitterListener) {
            const once = (event: EmitterEvent, data: EmitterListenerData) => {
                this.off(event, once);
                listener(event, data);
            };
            this.on(event, once);
        },

        emit(event: EmitterEvent, data: EmitterListenerData) {
            for (const listener of this.listeners[event]) listener(event, data);
        },
    };
}
