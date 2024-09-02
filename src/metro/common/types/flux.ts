export interface Dispatcher {
    _actionHandlers: unknown;
    _interceptors?: ((payload: any) => void | boolean)[];
    _currentDispatchActionType: undefined | string;
    _processingWaitQueue: boolean;
    _subscriptions: Record<string, Set<(payload: any) => void>>;
    _waitQueue: unknown[];

    addDependencies(node1: any, node2: any): void;
    dispatch(payload: any): Promise<void>;
    flushWaitQueue(): void;
    isDispatching(): boolean;
    register(name: string, actionHandler: Record<string, (e: any) => void>, storeDidChange: (e: any) => boolean): string;
    setInterceptor(interceptor?: (payload: any) => void | boolean): void;
    subscribe(actionType: string, callback: (payload: any) => void): void;
    unsubscribe(actionType: string, callback: (payload: any) => void): void;
    wait(cb: () => void): void;
}
