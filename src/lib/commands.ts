import { commands as commandsModule } from "@metro/common";
import { after } from "@lib/patcher";

let commands: ApplicationCommand[] = [];

export interface ApplicationCommand {
    description: string;
    name: string;
    options: ApplicationCommandOption[];
    execute: (args: any[], ctx: CommandContext) => CommandResult | void | Promise<CommandResult> | Promise<void>;
    id?: string;
    applicationId: string;
    displayName: string;
    displayDescription: string;
    inputType: ApplicationCommandInputType;
    type: ApplicationCommandType;
}

export enum ApplicationCommandInputType {
    BUILT_IN,
    BUILT_IN_TEXT,
    BUILT_IN_INTEGRATION,
    BOT,
    PLACEHOLDER,
}

export interface ApplicationCommandOption {
    name: string;
    description: string;
    required?: boolean;
    type: ApplicationCommandOptionType;
    displayName: string;
    displayDescription: string;
}

export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP,
    STRING,
    INTEGER,
    BOOLEAN,
    USER,
    CHANNEL,
    ROLE,
    MENTIONABLE,
    NUMBER,
    ATTACHMENT,
}

export enum ApplicationCommandType {
    CHAT = 1,
    USER,
    MESSAGE,
}

export interface CommandContext {
    channel: any;
    guild: any;
}

export interface CommandResult {
    content: string;
    tts?: boolean;
}

export function patchCommands() {
    const unpatch = after("getBuiltInCommands", commandsModule, ([type], res: ApplicationCommand[]) => {
        if (type === ApplicationCommandType.CHAT) return res.concat(commands);
    });

    return () => {
        commands = [];
        unpatch();
    };
}

export function registerCommand(command: ApplicationCommand): () => void {
    // Get built in commands
    const builtInCommands = commandsModule.getBuiltInCommands(ApplicationCommandType.CHAT, true, false);
    builtInCommands.sort((a: ApplicationCommand, b: ApplicationCommand) => parseInt(b.id!) - parseInt(a.id!));

    const lastCommand = builtInCommands[builtInCommands.length - 1];

    // Override the new command's id to the last command id - 1
    command.id = (parseInt(lastCommand.id, 10) - 1).toString();

    // Add it to the commands array
    commands.push(command);

    // Return command id so it can be unregistered
    return () => (commands = commands.filter(({ id }) => id !== command.id));
}
