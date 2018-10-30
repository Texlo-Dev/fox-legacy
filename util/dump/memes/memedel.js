const Command = require('../../util/core/Command');
const mongo = require('mongodb');
const grid = require('gridfs');
const { Database } = require('mongorito');
const connection = new Database('localhost/encipio');

module.exports = class MemeDel extends Command {

    constructor(client) {
        super(client, {
            name: 'memedel',
            description: 'Deletes a meme from the database.',
            usage: '<name>',
            guildOnly: true,
            requiredPerms: ['`meme.memelord`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('meme.memelord');
    }

    async run(message, args) {
        const db = await connection.connect();
        const gfs = new grid(db, mongo);
        const name = args[0];
        if (!name) return message.error(' Please specify a meme to delete.');
        await message.delete().catch(() => 0);

        gfs.remove({ filename: message.guild.id + name.toLowerCase() }, (err) => {
            if (err) return message.error(' Sorry, there was an error deleting that meme.');
            message.send(`Successfully deleted meme ${name}.`);
        });
    }

};
