import { findByNameProxy } from "@metro/utils";

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

export const DiscordLogger = findByNameProxy("Logger");
export const logger: Logger = new DiscordLogger("Bunny");
