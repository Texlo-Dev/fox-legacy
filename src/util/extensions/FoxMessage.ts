import { Message, MessageEmbed, util as splitMessage, CollectorFilter, MessageOptions, Structures } from "discord.js";
import { Command, FoxClient } from "..";
import { FoxGuild } from ".";
export default Structures.extend("Message", mes => {
    class FoxMessage extends mes {
        public command: Command;
        public client: FoxClient;
        public guild: FoxGuild;
        public responses: any;

        public constructor(...args) {
            super(...args);
            this.command = null;
        }

        public async sendPrompt(prompt: string, time: number, filter: CollectorFilter): Promise<number|string> {
            await this.channel.send(`${prompt}\nYou have ${time / 1000} seconds to respond, or you can cancel by typing \`cancel\`.`);
            const collected = await this.channel.awaitMessages(filter ? filter : m => m.author.id === this.author.id, { max: 1, time, errors: ["time"] }).catch(() => null);
            if (!collected) return undefined;
            if (collected.first().content.match(/cancel/i)) return 0;
            else return collected.first().content;
        }

        public async error(content: string, options?: MessageOptions): Promise<Message| Message[]> {
            content = this.guild.config.language !== "English" ? await this.client.translate(content, this.client.locales[this.guild.config.language]) : content;
            return this.channel.send(`<:nicexmark:495362785010647041> ${content}`, options);
        }

        public async success(content: string, options?: MessageOptions): Promise<Message| Message[]>{
            content = this.guild.config.language !== "English" ? await this.client.translate(content, this.client.locales[this.guild.config.language]) : content;
            return this.channel.send(`<:checkmark:495362807731060757> ${content}`, options);
        }

        public async sendMessage(content: string, options?: MessageOptions): Promise<Message| Message[]> {
            options = FoxMessage.combineContentOptions(content, options);
            content = options.content; // eslint-disable-line prefer-destructuring
            delete options.content;

            options.embed = options.embed || null;
            try {
                if (options.embed && this.guild.config.language !== "English") {
                    this.channel.startTyping();
                    if (options.embed.title) options.embed.title = await this.client.translate(options.embed.title, this.client.locales[this.guild.config.language]);
                    if (options.embed.description) options.embed.description = await this.client.translate(options.embed.description.replace(/\n/g, "xyz"), this.client.locales[this.guild.config.language]);
                    if (options.embed.description) options.embed.description = options.embed.description.replace(/xyz/gi, "\n");
                    if (options.embed.author) options.embed.author.name = await this.client.translate(options.embed.author.name, this.client.locales[this.guild.config.language]);
                    if (options.embed.footer) options.embed.footer.text = await this.client.translate(options.embed.footer.text, this.client.locales[this.guild.config.language]);
                    for (const field of options.embed.fields) {
                        field.name = await this.client.translate(field.name, this.client.locales[this.guild.config.language]);
                    }
                }
            } catch (error) {
                this.channel.stopTyping();
                return this.channel.send(`<:nicexmark:495362785010647041> I could not translate this command. ${error}`);
            }

            if (this.responses && typeof options.files === "undefined") {
                if (options && options.split) content = splitMessage(content, options.split);
                if (Array.isArray(content)) {
                    const promises = [];
                    if (Array.isArray(this.responses)) {
                        for (let i = 0; i < content.length; i++) {
                            if (this.responses.length > i) promises.push(this.responses[i].edit(content[i], options));
                            else promises.push(this.channel.send(content[i]));
                        }
                        if (this.responses.length > content.length) {
                            for (let i = content.length; i < this.responses.length; i++) this.responses[i].delete();
                        }
                    } else {
                        promises.push(this.responses.edit(content[0], options));
                        for (let i = 1; i < content.length; i++) promises.push(this.channel.send(content[i]));
                    }
                    return Promise.all(promises)
                        .then(prm => {
                            this.responses = prm;
                            return prm;
                        });
                } else if (Array.isArray(this.responses)) {
                    for (let i = this.responses.length - 1; i > 0; i--) this.responses[i].delete();
                    [this.responses] = this.responses;
                }
                return this.responses.edit(content, options);
            }
            this.channel.stopTyping();
            return this.channel.send(content, options)
                .then(mess => {
                    if (typeof options.files === "undefined") this.responses = mess;
                    return mess;
                });
        }

        public async send(content: any, options?: MessageOptions): Promise<Message| Message[]> {
            content = this.guild.config.language !== "English"
            ? options && options.translate !== false
            ? await this.client.translate(content, this.client.locales[this.guild.config.language])
            : content
            : content;
            return this.sendMessage(content, options);
        }

        public async FoxEmbed(options: any, text: string): Promise<Message| Message[]> {
            const foxembed = new MessageEmbed()
                .setColor(this.client.brandColor)
                .setDescription(text || "")
                .setTimestamp()
                .setFooter(options.footer || this.client.user.username)
                .setAuthor(options.header || "", this.client.user.displayAvatarURL());
            return this.send(null, foxembed);
        }

        public _registerCommand(command: Command): void {
            this.command = command;
        }

        public static combineContentOptions(content: any, options: any): any {
            if (!options) return isObject(content) ? content : { content };
            return Object.assign(options, { content });
        }

    }
    return FoxMessage;
});

function isObject(input: any): boolean {
    return Object.prototype.toString.call(input) === "[object Object]";
}
