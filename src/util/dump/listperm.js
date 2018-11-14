const { MessageEmbed } = require('discord.js');

module.exports = class ListPerm extends Command {

    constructor(client) {
        super(client, {
            name: 'listperm',
            description: 'Shows the available permissions to assign.',
            guildOnly: true,
            requiredPerms: ['`core.manapgeperm`']
        });
    }

    hasPermission(message) {
        return FoxClient.isOwner(message.author.id) || message.guild.perms.check('core.manageperm');
    }

    async run(message) {
        const sorted = message.guild.permissions.array().sort((p, c) => p.category > c.category ? 1 : p.name > c.name && p.category === c.category ? 1 : -1);
        let output = '';
        let currentCategory = '';
        sorted.forEach(c => {
            const cat = capitalizeFirstLetter(c.category);
            if (currentCategory !== cat) {
                output += `\n**${cat}**\n`;
                currentCategory = cat;
            }
            output += `\`${c.name}\`: ${c.description}\n`;
        });

        const embed = new MessageEmbed()
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setAuthor('Available Permisssions', this.client.user.displayAvatarURL())
            .setFooter(this.client.user.username)
            .setDescription(`${output}`);
        message.send({ embed });
    }

};


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
