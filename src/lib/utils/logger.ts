import { findByProps } from "@metro/filters";

export type LoggerFunction = (...messages: any[]) => void;
export interface Logger {
    log: LoggerFunction;
    info: LoggerFunction;
    warn: LoggerFunction;
    error: LoggerFunction;
    time: LoggerFunction;
    trace: LoggerFunction;
    verbose: LoggerFunction;
}

export const logModule = findByProps("setLogFn").default;
const logger: Logger = new logModule("Bunny");

export default logger;
