const Command = require('../../util/core/Command');
const mongo = require('mongodb');
const { GridStore } = require('mongodb');
const imagedownload = require('image-downloader');
const { Database } = require('mongorito');
const connection = new Database('localhost/encipio');

module.exports = class MemeAdd extends Command {

    constructor(client) {
        super(client, {
            name: 'memeadd',
            description: 'Adds a meme to the database.',
            usage: '<name> <link>',
            guildOnly: true,
            requiredPerms: ['`meme.memelord`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('meme.memelord');
    }

    async run(message, args) {
        const db = await connection.connect();
        const name = args[0];
        const link = args[1];
        if (!name) return message.send('Please specify a name for the meme.');
        if (!link) return message.send('Please specify a meme link.');
        const res = await imagedownload.image({ url: link, dest: require('path').join(__dirname, '../../imgdun') }).catch(() => null);
        if (!res) return message.error(' Sorry, that was an invalid image link.');
        await message.delete().catch(() => 0);
        message.channel.send(res.filename.split(`${process.cwd()}imgdun`)[1]);

        /* gfs.writeFile({ filename: message.guild.id + name.toLowerCase() }, res.image, (err) => {
            if (err) return message.send('sorry, there was an error adding that meme.');
            require('fs').unlinkSync(res.filename);
            return message.send(`Successfully added meme ${name}.`);
        });*/
    }

};
