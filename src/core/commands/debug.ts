import { Strings } from "@/core/i18n";
import { getDebugInfo } from "@lib/debug";
import { messageUtil } from "@metro/common";
import { ApplicationCommand, ApplicationCommandOptionType } from "@/lib/api/commands/types";

export default () => <ApplicationCommand>{
    name: "debug",
    description: Strings.COMMAND_DEBUG_DESC,
    options: [
        {
            name: "ephemeral",
            type: ApplicationCommandOptionType.BOOLEAN,
            description: Strings.COMMAND_DEBUG_OPT_EPHEMERALLY,
        }
    ],
    execute([ephemeral], ctx) {
        const info = getDebugInfo();
        const content = [
            "**Bunny Debug Info**",
            `> Bunny: ${info.bunny.version} (${info.bunny.loader})`,
            `> Discord: ${info.discord.version} (${info.discord.build})`,
            `> React: ${info.react.version} (RN ${info.react.nativeVersion})`,
            `> Hermes: ${info.hermes.version} (bcv${info.hermes.bytecodeVersion})`,
            `> System: ${info.os.name} ${info.os.version} (SDK ${info.os.sdk})`,
            `> Device: ${info.device.model} (${info.device.codename})`,
        ].join("\n");

        if (ephemeral?.value) {
            messageUtil.sendBotMessage(ctx.channel.id, content);
        } else {
            messageUtil.sendMessage(ctx.channel.id, { content });
        }
    }
}