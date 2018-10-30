const urban = require('urban');
const { MessageEmbed } = require('discord.js');
const Command = require('../../util/core/Command');

module.exports = class UrbanCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'urban',
            description: 'Searches urban dictionary!',
            usage: '<search term>'
        });
    }

    async run(message, args) {
        const searchterm = args.join(' ');
        if (!searchterm) return message.error(' Please specify something to search!');
        const res = urban(searchterm);
        res.first(json => {
            if (!json) return message.error(' Oops, looks like I couldn\'t find anything about that.');
            if (json.definition.length > 400 || json.example.length > 400 || json.author.length > 400) return message.send(`Text was too long, so here's the link! ${json.permalink}`);
            const embed = new MessageEmbed()
                .setAuthor('Urban Dictionary', this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .addField(json.word, json.definition)
                .addField('Example:', json.example)
                .addField('Author', json.author)
                .addField('Upvotes', json.thumbs_up)
                .addField('Permanent Link:', json.permalink);
            message.send({ embed });
        });
    }

};
