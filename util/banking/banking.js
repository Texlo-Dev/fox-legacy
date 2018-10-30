const members = [];

module.exports = async message => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!IsMsgWorthIt(message)) return;
    const prefix = message.guild ? message.guild.config.prefix : message.client.commandPrefix;
    if (message.content.startsWith(prefix)) return;
    if (!message.guild.packages.get('Economy').enabled) return;
    const guild = await this.client.mongo.banking.findOne({ guild: message.guild.id });
    if (guild) {
        const excluded = guild.get('excludedChannels');
        if (excluded.includes(message.channel.id)) return;
    }
    const entry = await this.client.mongo.banking.findOne({
        guildID: message.guild.id,
        userID: message.author.id
    });
    if (!entry) {
        const ent = new message.client.mongo.banking({
            guildID: message.guild.id,
            userID: message.author.id,
            level: 1,
            XP: 0,
            totalXP: 0,
            toNextLevel: 100,
            money: 0,
            timeUntilDaily: Date.now()
        });
        await ent.save();
    } else {
        if (members.includes(message.author.id)) return;
        members.push(message.author.id);
        setInterval(() => members.splice(members.indexOf(message.author.id), 1), 35000);
        const XPgain = getXPgain(entry.get('level'));
        const total = entry.get('money') + randomNum(10, 25);
        entry.set({
            money: total,
            XP: entry.get('XP') + XPgain,
            totalXP: entry.get('totalXP') + XPgain
        });
        await entry.save();
        if (entry.get('XP') >= entry.get('toNextLevel')) {
            const nextLevel = entry.get('toNextLevel');
            entry.set({
                XP: 0,
                level: entry.get('level') + 1,
                toNextLevel: Math.round(nextLevel * 1.19)
            });
            await entry.save();
            message.client.emit('levelUp', message, entry.get('level'));
        }
    }
};

function randomNum(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getXPgain(level) {
    if (level >= 35) return level * 10;
    else if (level >= 27) return randomNum(110, 115);
    else return randomNum(10, 15);
}

function IsMsgWorthIt(message) {
    const text = message.content.toLowerCase();
    const mentions = message.mentions;

    const substantialWords = [
        'js', 'javascript', 'node', 'nodejs', 'code', 'pars', 'script', 'clojure', 'sql',
        'discord', 'moment', 'snekfetch', 'dithcord', 'guide', 'video', 'bot', 'dev', 'git',
        'github', 'discord.js', 'snekie', 'mod.banhammer', 'mrfox', 'rtexel', 'jacz', 'the', 'this',
        'that', 'hello'
    ].concat(Object.keys(process.binding('natives')));

    // Words that might indicate that this message is lower quality
    const insubstantialWords = ['lol', 'lul', 'lel', 'kek', 'xd', '¯\\_(ツ)_/¯', 'dicksword', 'gus', 'kys', 'dumbass',
        '!', '-', '.'];

    // The amount of "substance" needed for points to be awarded for this message
    const necessarySubstance = 10;

    // Messages with @everyone or @here pings should never be awarded points
    if (mentions.roles.some(r => [message.guild.id].includes(r.id))) return false;

    let substance = 0;

    if (text.length > 'lol xD'.length) (substance += 400) * ((substance - 5) / 1995) + 7; // eslint-disable-line

    substance += substantialWords.reduce((num, word) => text.includes(word) ? num + 2 : num, 0);

    substance -= insubstantialWords.reduce((num, word) => text.includes(word) ? num + 1 : num, 0);
    if (mentions.users.size > 0) substance -= mentions.users.size;
    else if (mentions.roles.size > 3) substance -= mentions.roles.size;
    else if (mentions.channels.size > 5) substance -= mentions.channels.size;
    else substance += 2;

    return substance >= necessarySubstance;
}

