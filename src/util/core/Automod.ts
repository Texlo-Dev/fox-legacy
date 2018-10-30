const inviteRegex = new RegExp(/\b(?:https?:\/\/)?(?:www\.)?(?:discordapp\.com\/invite\/|discord\.gg\/)([\w-]{2,32})/gi);

export const badWords = message => {
    if (!message.guild) return;
    if (!message.guild.config.bwProtected) return;
    if (message.guild.perms.check("automod.freespeech", message)) return;
    if (message.guild.config.allowedBwChannels) {
        for (const channel of message.guild.config.allowedBwChannels) {
            if (message.channel.id === channel.id) return;
        }
    }
    const words = message.guild.config.badWords;
    if (!words) return;
    for (const word of words) {
        const regex = new RegExp(`${word}`, "i");
        if (regex.test(message.content)) {
            message.delete().catch(() => 0);
            message.author.send("A blacklisted word was detected in your message, and it has been removed.");
        }
    }
};

export const invProtect = message => {
    if (!message.member) return;
    if (!message.guild) return;
    const sp = message.guild.config.invProtected;
    if (sp && message.guild.me.hasPermission("MANAGE_MESSAGES") && !message.guild.perms.check("automod.sendinvites", message) && message.content.match(inviteRegex)) {
        message.delete().catch(() => 0);
        message.author.send("You message was deleted, because it contained a Discord invite. Please do not advertise here.").catch(() => 0);
    }
};
export const massProtect = async message => {
    if (!message.guild) return;
    const sp = message.guild.serverprotect;
    const spEnabled = message.guild.config.massProtected;
    const exempted = message.guild.config.allowedMentionChannels;
    if (!spEnabled) return;
    if (exempted && exempted.some(channel => channel.id === message.channel.id)) return;
    if (message.guild.perms.check("automod.freespeech", message)) return;
    const threshold = message.guild.config.mentionLimit;
    const massrole = await sp.massRole(message.content);
    if (massrole && massrole.length >= threshold) {
        message.delete().catch(() => 0);
        sp.warnMute(message.member, "Mass role mentioning detected.");
    }
};

export const spamProtect = message => {
    if (!message.guild) return;
    const sp = message.guild.serverprotect;
    const enabled = message.guild.config.spamProtected;
    if (!enabled) return;
    if (message.author.bot) return;

    const struct = { member: message.member, messages: 0, time: Math.floor(Date.now()) };
    if (message.author.id !== message.client.user.id && !sp.members.has(message.author.id)) {
        sp.members.set(message.author.id, struct);
    } else {
        sp.members.get(message.author.id).messages++;
    }

    sp.members.forEach(m => {
        if (m.time < Math.round(Date.now()) - 3500) sp.members.delete(m.member.id);
        else if (m.messages === sp.maxwarn) return sp.warnMute(m.member, "Spam detected.");
    });
};
