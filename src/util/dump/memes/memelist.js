const Command = require('../../util/core/Command');
const mongo = require('mongodb');
const grid = require('gridfs');
const { Database } = require('mongorito');
const { MessageEmbed } = require('discord.js');
const connection = new Database('localhost/encipio');

module.exports = class MemeCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'memelist',
            description: 'Shows all of the available memes for the server.',
            guildOnly: true,
            requiredPerms: ['`meme.memer`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('meme.memer');
    }

    async run(message) {
        const db = await connection.connect();
        const gfs = new grid(db, mongo);

        gfs.list((err, array) => {
            if (err) return message.error(' Oops, there was an error while doing this operation.');
            const guildMemes = array.filter(memename => memename.includes(message.guild.id)).map(memes => memes.split(message.guild.id)[1]);
            const embed = new MessageEmbed()
                .setFooter(`${this.client.user.username}`)
                .setColor(this.client.brandColor)
                .setAuthor('Server Memes', this.client.user.displayAvatarURL())
                .setTimestamp()
                .setDescription(`❯ Memes for **${message.guild.name}**:\n\n**${guildMemes.sort().join(', ') || 'No memes available!'}**`);
            message.send({ embed });
        });
    }

};
