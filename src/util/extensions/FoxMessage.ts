import { CollectorFilter, Message, MessageEmbed, MessageOptions, Structures, Util as splitMessage } from "discord.js";
import { FoxGuild } from ".";
import { Command, FoxClient } from "..";
export default Structures.extend("Message", (mes) => {
    class FoxMessage extends mes {

        public static combineContentOptions(content: any, options: any): any {
            if (!options) { return isObject(content) ? content : { content }; }

            return {...options,  content};
        }
        public client: FoxClient;
        public command: Command;
        public guild: FoxGuild;
        public responses: any;

        public constructor(...args) {
            super(...args);
            this.command = null;
        }

        public _registerCommand(command: Command): void {
            this.command = command;
        }

        public async error(content: string, options?: MessageOptions): Promise<Message | Message[]> {
            content = this.guild.config.language !== "English" // tslint:disable-line
                ? (await this.client.translate(
                    content, { from: "en", to: this.client.locales[this.guild.config.language] }
                )).text
                : content;

            return this.channel.send(`<:nicexmark:495362785010647041> ${content}`, options);
        }

        public async FoxEmbed(options: any, text: string): Promise<Message | Message[]> {
            const foxembed: MessageEmbed = new MessageEmbed()
                .setColor(this.client.brandColor)
                .setDescription(text || "")
                .setTimestamp()
                .setFooter(options.footer || this.client.user.username)
                .setAuthor(options.header || "", this.client.user.displayAvatarURL());

            return this.send(null, { embed: foxembed });
        }

        public async send(content: any, options?: MessageOptions): Promise<Message | Message[]> {
            content = this.guild.config.language !== "English" // tslint:disable-line
                ? options && options.translate !== false
                ? (await this.client.translate(content, { from: "en", to: this.client.locales[this.guild.config.language] })).text
                : content
                : content;

            return this.sendMessage(content, options);
        }

        public async sendMessage(content: string, options?: MessageOptions): Promise<Message | Message[]> {
            options = FoxMessage.combineContentOptions(content, options); // tslint:disable-line
            content = options.content; // tslint:disable-line
            delete options.content;

            options.embed = options.embed || undefined;
            try {
                if (options.embed && this.guild.config.language !== "English") {
                    this.channel.startTyping();
                    if (options.embed.title) {
                        ({ text: options.embed.title } = await this.client.translate(
                            options.embed.title,
                            { from: "en", to: this.client.locales[this.guild.config.language] }
                        ));
                    }
                    if (options.embed.description) {
                        ({ text: options.embed.description } = await this.client.translate(
                            options.embed.description.replace(/\n/g, "xyz"),
                            { from: "en", to: this.client.locales[this.guild.config.language] }));
                        }
                    if (options.embed.description) {
                        options.embed.description = options.embed.description.replace(/xyz/gi, "\n");
                    }
                    if (options.embed.author) {
                        ({ text: options.embed.author.name } = await this.client.translate(
                            options.embed.author.name, {
                                from: "en",
                                to: this.client.locales[this.guild.config.language]
                            }));
                        }
                    if (options.embed.footer) {
                        ({ text: options.embed.footer.text } = await this.client.translate(
                            options.embed.footer.text, { to: this.client.locales[this.guild.config.language] }));
                        }
                    for (const field of options.embed.fields) {
                        ({ text: field.name } = await this.client.translate(
                            field.name,
                            { from: "en", to: this.client.locales[this.guild.config.language] }
                        ));
                    }
                }
            } catch (error) {
                this.channel.stopTyping();

                return this.channel.send(
                    `<:nicexmark:495362785010647041> I could not translate this command. ${error.message}`
                );
            }

            if (this.responses && typeof options.files === "undefined") {
                if (options && options.split) {
                    content = splitMessage(content, options.split);
                }
                if (Array.isArray(content)) {
                    const promises = [];
                    if (Array.isArray(this.responses)) {
                        for (let i = 0; i < content.length; i++) {
                            if (this.responses.length > i) {
                                promises.push(this.responses[i].edit(content[i], options));
                            } else { promises.push(this.channel.send(content[i])); }
                        }
                        if (this.responses.length > content.length) {
                            for (let i = content.length; i < this.responses.length; i++) { this.responses[i].delete(); }
                        }
                    } else {
                        promises.push(this.responses.edit(content[0], options));
                        for (let i = 1; i < content.length; i++) { promises.push(this.channel.send(content[i])); }
                    }

                    return Promise.all(promises)
                        .then((prm) => {
                            this.responses = prm;

                            return prm;
                        });
                } else if (Array.isArray(this.responses)) {
                    for (let i = this.responses.length - 1; i > 0; i--) { this.responses[i].delete(); }
                    [this.responses] = this.responses;
                }

                return this.responses.edit(content, options);
            }
            this.channel.stopTyping();

            return this.channel.send(content, options)
                .then((mess) => {
                    if (typeof options.files === "undefined") { this.responses = mess; }

                    return mess;
                });
        }

        public async sendPrompt(prompt: string, time: number, filter?: CollectorFilter): Promise<number | string> {
            await this.channel.send(
                `${prompt}\nYou have ${time / 1000} seconds to respond, or you can cancel by typing \`cancel\`.
            `);
            const collected: any = await this.channel.awaitMessages(
                filter
                ? filter
                : (m) => m.author.id === this.author.id, {
                    max: 1, time, errors: ["time"]
                }
            )
                .catch(() => undefined);
            if (!collected) { return undefined; }
            if (collected.first().content
                .match(/cancel/i)) { return 0; } else { return collected.first().content; }
        }

        public async success(content: string, options?: MessageOptions): Promise<Message | Message[]> {
            content = this.guild.config.language !== "English"
                ? (
                    await this.client.translate(content, {
                        from: "en",
                        to: this.client.locales[this.guild.config.language]
                    })
                ).text
                : content;

            return this.channel.send(`<:checkmark:495362807731060757> ${content}`, options);
        }

    }

    return FoxMessage;
});

function isObject(input: any): boolean {
    return Object.prototype.toString.call(input) === "[object Object]";
}
