const authors = [];
const muted = [];
const banned = [];
const messages = [];
const { MessageEmbed } = require('discord.js');

class ServerProtect {

    constructor(client, options = {}) {
        this.client = client;
        this.warnBuffer = options.warnBuffer || 3;
        this.maxBuffer = options.maxBuffer || 5;
        this.interval = options.interval || 1000;
        this.muteMessage = options.muteMessage;
        this.warnMessage = options.warningMessage || 'stop spamming or I\'ll whack your head off.';
        this.banMessage = options.banMessage || 'has been banned for spamming, anyone else?';
        this.maxDuplicatesWarning = options.maxDuplicateWarn || 7;
        this.maxDuplicatesBan = options.maxDuplicatesBan || 10;


        this.client.on('message', async message => {
            if (!message.guild) return;
            const enabled = message.guild.settings ? await message.guild.settings.checkPkgEnabled('Automod') : null;
            if (!enabled) return;
            const enabled2 = message.guild.settings ? await message.guild.settings.serverProtectEnabled : null;
            if (!enabled2) return;
            if (message.author.bot) return;
            if (message.author.id !== this.client.user.id) {
                var now = Math.floor(Date.now());
                authors.push({
                    time: now,
                    author: message.author.id
                });
                messages.push({
                    message: message.content,
                    author: message.author.id
                });
            }

            /*

            var match = 0;
            for (var i = 0; i < messages.length; i++) {
                if (messages[i].message === message.content && (messages[i].author === message.author.id) && (message.author.id !== this.client.user.id)) {
                    match++;
                }
            }

            if (match === this.maxDuplicatesBan && !banned.includes(message.author.id)) {
                let user = await this.ban(message, message.author.id);
                if (!user) return;
                let channel = await message.guild.settings.modLoggingEnabled;
                if (!channel) return;
                let modlog = await message.guild.settings.modlogChannel;
                if (!modlog) return;
                let caseEntry = await this.client.mongo.modactions.count({guildID: message.guild.id, id: undefined});
                let caseInt = caseEntry + 1;
                const embed = new MessageEmbed()
                    .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
                    .setColor('RANDOM')
                    .setTimestamp()
                    .setDescription(`**Action:** Automatic Ban\n**Member:** ${user.tag} (${user.id})\n*This action was done automatically, as signs of spam were detected.*`)
                    .setFooter(`Case#${caseInt}`);
                let ch = message.guild.channels.get(modlog);
                if (ch) ch.send({embed});

                let entry = new this.client.mongo.modactions({
                    guildID: message.guild.id,
                    caseNum: caseInt,
                    userID: user.id,
                    action: 'Automatic Ban',
                    reasonFor: 'This action was done automatically, as sign of spam were detected.',
                    modID: this.client.user.id,
                    createdAt: message.createdAt
                });
                await entry.save();

            } else if (match === this.maxDuplicatesWarning && !muted.includes(message.author.id)) {
                let mem = await this.muteWarn(message, message.author.id);
                if (!mem) return;
                let channel = await message.guild.settings.modLoggingEnabled;
                if (!channel) return;
                let modlog = await message.guild.settings.modlogChannel;
                if (!modlog) return;
                let caseEntry = await this.client.mongo.modactions.count({guildID: message.guild.id, id: undefined});
                let caseInt = caseEntry + 1;
                const embed = new MessageEmbed()
                    .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
                    .setColor('RANDOM')
                    .setTimestamp()
                    .setDescription(`**Action:** Automatic Mute\n**Member:** ${mem.user.tag} (${mem.user.id})\n*This action was done automatically, as signs of spam were detected.*`)
                    .setFooter(`Case#${caseInt}`);
                let ch = message.guild.channels.get(modlog);
                if (ch) ch.send({embed});

                let entry = new this.client.mongo.modactions({
                    guildID: message.guild.id,
                    caseNum: caseInt,
                    userID: mem.user.id,
                    action: 'Automatic Mute',
                    reasonFor: 'This action was done automatically, as sign of spam were detected.',
                    modID: this.client.user.id,
                    createdAt: message.createdAt
                });
                await entry.save();

            }*/


            let matched = 0;
            for (var l = 0; l < authors.length; l++) {
                if (authors[l].time > now - this.interval) {
                    matched++;
                    if (matched === this.maxBuffer && !banned.includes(message.author.id)) {
                        const user = await this.ban(message, message.author.id);
                        if (!user) return;
                        const channel = await message.guild.settings.modLoggingEnabled;
                        if (!channel) return;
                        const modlog = await message.guild.settings.modlogChannel;
                        if (!modlog) return;
                        const caseEntry = await this.client.mongo.modactions.count({ guildID: message.guild.id, id: undefined });
                        const caseInt = caseEntry + 1;
                        const embed = new MessageEmbed()
                            .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
                            .setColor('RANDOM')
                            .setTimestamp()
                            .setDescription(`**Action:** Automatic Ban\n**Member:** ${user.tag} (${user.id})\n*This action was done automatically, as signs of spam were detected.*`)
                            .setFooter(`Case#${caseInt}`);
                        const ch = message.guild.channels.get(modlog);
                        if (ch) ch.send({ embed });

                        const entry = new this.client.mongo.modactions({
                            guildID: message.guild.id,
                            caseNum: caseInt,
                            userID: user.id,
                            action: 'Automatic Ban',
                            reasonFor: 'This action was done automatically, as sign of spam were detected.',
                            modID: this.client.user.id,
                            createdAt: message.createdAt
                        });
                        await entry.save();
                    } else if (matched === this.warnBuffer) {
                        if (!muted.includes(message.author.id)) {
                            const mem = await this.muteWarn(message, message.author.id);
                            if (!mem) return;
                            const channel = await message.guild.settings.modLoggingEnabled;
                            if (!channel) return;
                            const modlog = await message.guild.settings.modlogChannel;
                            if (!modlog) return;
                            const caseEntry = await this.client.mongo.modactions.count({ guildID: message.guild.id, id: undefined, warnpoints: undefined });
                            const caseInt = caseEntry + 1;
                            const embed = new MessageEmbed()
                                .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
                                .setColor('RANDOM')
                                .setTimestamp()
                                .setDescription(`**Action:** Automatic Mute\n**Member:** ${mem.user.tag} (${mem.user.id})\n*This action was done automatically, as signs of spam were detected.*`)
                                .setFooter(`Case#${caseInt}`);
                            const ch = message.guild.channels.get(modlog);
                            if (ch) ch.send({ embed });


                            const entry = new this.client.mongo.modactions({
                                guildID: message.guild.id,
                                caseNum: caseInt,
                                userID: mem.user.id,
                                action: 'Automatic Mute',
                                reasonFor: 'This action was done automatically, as sign of spam were detected.',
                                modID: this.client.user.id,
                                createdAt: message.createdAt
                            });
                            await entry.save();
                        }
                    }
                } else if (authors[l].time < now - this.interval) {
                    authors.splice(l);
                    muted.splice(muted.indexOf(authors[l]));
                    banned.splice(banned.indexOf(authors[l]));
                }
                if (messages.length >= 200) {
                    messages.shift();
                }
            }
        });
    }

    async muteWarn(message, memberID) {
        if (message.author.id === this.client.user.id) return;
        const member = await message.guild.members.fetch(memberID);
        const muteRole = await message.guild.settings.muteRole;
        if (member.roles.has(muteRole)) return;
        if (!muteRole) {
            muted.push(memberID);
            this.client.users.get(memberID).send(this.warnMessage);
        } else {
            muted.push(memberID);
            const role = await message.guild.roles.get(muteRole);
            if (!role) return;
            try {
                message.guild.channels.forEach(channel => channel.overwritePermissions(role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                }));
                await member.roles.add(role);
                member.send(this.muteMessage);
                return member;
            } catch (err) {
                message.send(`Insufficient permissions to mute ${member.user}: Please ask a server admin to manually mute them.`);
                return;
            }
        }
    }


    async ban(message, userID) {
        if (message.author.id === this.client.user.id) return;
        for (var i = 0; i < messages.length; i++) {
            if (messages[i].author === message.author.id) {
                messages.splice(i);
            }
        }

        banned.push(userID);
        const member = await message.guild.members.fetch(message.author);
        const muteRole = await message.guild.settings.muteRole;
        if (muteRole && member.roles.has(muteRole)) return;

        try {
            await member.send(this.banMessage);
            member.ban({ days: 4 });
            return member.user;
        } catch (err) {
            message.send(`Insufficient permissions to ban ${message.author} for spamming.`);
            return;
        }
    }


}

module.exports = ServerProtect;
