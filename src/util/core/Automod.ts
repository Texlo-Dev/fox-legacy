import { ServerProtect } from "..";
import { FoxMessage } from "../extensions";

const inviteRegex = new RegExp(
  /\b(?:https?:\/\/)?(?:www\.)?(?:discordapp\.com\/invite\/|discord\.gg\/)([\w-]{2,32})/gi
);
export const badWords: (message: FoxMessage) => void = (
  message: FoxMessage
) => {
  if (
    !message.guild ||
    !message.guild.config.bwProtected ||
    message.guild.perms.check("automod.freespeech", message)
  ) {
    return;
  }
  if (message.guild.config.allowedBwChannels) {
    for (const channel of message.guild.config.allowedBwChannels) {
      if (message.channel.id === channel.id) {
        return;
      }
    }
  }
  const words: string[] = message.guild.config.badWords;
  if (!words) {
    return;
  }
  for (const word of words) {
    const regex: RegExp = new RegExp(`${word}`, "i");
    if (regex.test(message.content)) {
      message.delete().catch(() => 0);
      message.author.send(
        "A blacklisted word was detected in your message, and it has been removed."
      );
    }
  }
};

export const invProtect: (message: FoxMessage) => void = (
  message: FoxMessage
) => {
  if (!message.guild || !message.member) {
    return;
  }
  const sp: boolean = message.guild.config.invProtected;
  if (
    sp &&
    message.guild.me.hasPermission("MANAGE_MESSAGES") &&
    !message.guild.perms.check("automod.sendinvites", message) &&
    message.content.match(inviteRegex)
  ) {
    // tslint:disable-line
    message.delete().catch(() => 0);
    message.author
      .send(
        "You message was deleted, because it contained a Discord invite. Please do not advertise here."
      )
      .catch(() => 0);
  }
};
export const massProtect: (message: FoxMessage) => void = async (
  message: FoxMessage
) => {
  if (!message.guild) {
    return;
  }
  const sp: ServerProtect = message.guild.serverprotect;
  const spEnabled: boolean = message.guild.config.massProtected;
  const exempted: any[] = message.guild.config.allowedMentionChannels;
  if (!spEnabled) {
    return;
  }
  if (exempted && exempted.some(channel => channel.id === message.channel.id)) {
    return;
  }
  if (message.guild.perms.check("automod.freespeech", message)) {
    return;
  }
  const threshold: number = message.guild.config.mentionLimit;
  const massrole: RegExpMatchArray = await ServerProtect.massRole(
    message.content
  );
  if (massrole && massrole.length >= threshold) {
    message.delete().catch(() => 0);
    sp.warnMute(message.member, "Mass role mentioning detected.");
  }
};

export const spamProtect: (message: FoxMessage) => void = (
  message: FoxMessage
) => {
  if (!message.guild) {
    return;
  }
  const sp: ServerProtect = message.guild.serverprotect;
  const enabled: boolean = message.guild.config.spamProtected;
  if (!enabled) {
    return;
  }
  if (message.author.bot) {
    return;
  }

  const struct: object = {
    member: message.member,
    messages: 0,
    time: Math.floor(Date.now())
  };
  if (
    message.author.id !== message.client.user.id &&
    !sp.members.has(message.author.id)
  ) {
    sp.members.set(message.author.id, struct);
  } else {
    sp.members.get(message.author.id).messages++;
  }

  sp.members.forEach(m => {
    if (m.time < Math.round(Date.now()) - 3500) {
      sp.members.delete(m.member.id);
    } else if (m.messages === sp.maxwarn) {
      return sp.warnMute(m.member, "Spam detected.");
    }
  });
};
