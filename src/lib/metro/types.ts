import type { Nullish } from "@types";

export namespace Metro {
    export interface DependencyMap {
        readonly [indexer: number]: ModuleID;
        readonly paths?: Readonly<Record<ModuleID, string>> | undefined;
    }

    export type InverseDependencyMap = Record<ModuleID, ModuleID[]>;

    export type FactoryFn = (
        global: object,
        require: RequireFn,
        metroImportDefault: RequireFn,
        metroImportAll: RequireFn,
        moduleObject: {
            exports: any;
        },
        exports: any,
        dependencyMap: DependencyMap | Nullish,
    ) => void;

    export interface HotModuleReloadingData {
        _acceptCallback: (() => void) | Nullish;
        _disposeCallback: (() => void) | Nullish;
        _didAccept: boolean;
        accept: (callback?: (() => void) | undefined) => void;
        dispose: (callback?: (() => void) | undefined) => void;
    }

    export type ModuleID = string | number;

    export interface Module {
        id?: ModuleID | undefined;
        exports: any;
        hot?: HotModuleReloadingData | undefined;
    }

    export interface ModuleDefinition {
        dependencyMap: DependencyMap | Nullish;
        error?: any;
        factory: FactoryFn | undefined;
        hasError: boolean;
        hot?: HotModuleReloadingData | undefined;
        importedAll: any;
        importedDefault: any;
        isInitialized: boolean;
        path?: string | undefined;
        publicModule: Module;
        verboseName?: string | undefined;
    }

    export type ModuleList = Record<ModuleID, ModuleDefinition | Nullish>;

    export type RequireFn = (id: ModuleID) => any;

    export type DefineFn = (
        factory: FactoryFn,
        moduleId: ModuleID,
        dependencyMap?: DependencyMap | undefined,
        verboseName?: string | undefined,
        inverseDependencies?: InverseDependencyMap | undefined
    ) => void;

    export type ModuleDefiner = (moduleId: ModuleID) => void;

    export type ClearFn = () => ModuleList;

    export type RegisterSegmentFn = (
        segmentId: number,
        moduleDefiner: ModuleDefiner,
        moduleIds: Readonly<ModuleID[]> | Nullish
    ) => void;

    export interface Require extends RequireFn {
        importDefault: RequireFn;
        importAll: RequireFn;
        /** @throws {Error} */
        context: () => never;
        /** @throws {Error} */
        resolveWeak: () => never;
        unpackModuleId: (moduleId: ModuleID) => {
            localId: number;
            segmentId: number;
        };
        packModuleId: (value: {
            localId: number;
            segmentId: number;
        }) => ModuleID;
    }
}

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
