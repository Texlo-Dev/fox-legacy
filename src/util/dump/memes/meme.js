const Command = require('../../util/core/Command');
const mongo = require('mongodb');
const grid = require('gridfs');
const { Database } = require('mongorito');
const connection = new Database('localhost/encipio');

module.exports = class MemeCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'meme',
            description: 'Pulls a meme from the database.',
            usage: '<name>',
            guildOnly: true,
            requiredPerms: ['`meme.memer`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('meme.memer');
    }

    async run(message, args) {
        await message.delete().catch(() => 0);
        const db = await connection.connect();
        const gfs = new grid(db, mongo);
        const memename = args.join(' ');
        if (!memename) return message.error(' Please specify a meme to see.');

        gfs.readFile({ filename: message.guild.id + memename.toLowerCase() }, (err, file) => {
            if (err) return message.error(' Sorry, that meme did not exist.');
            message.send({ files: [file] });
        });
    }

};
