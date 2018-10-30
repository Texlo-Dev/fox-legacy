import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { load } from 'cheerio';
import { request } from 'axios';
import { parse } from 'querystring';
import { Command } from '../../util';

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'google',
            description: 'Searches Google, with a provided search query.',
            usage: '<query>',
            alaises: ['g', 'googlesearch']
        });
    }

    async run(message, args) {
        const query = args.join(' ');
        const initmsg = await message.send('<a:typing:393848431413559296> Searching...');
        if (!query) return message.error(' Please specify something to search on Google.');
        try {
            const { data } = await request({
                method: 'GET',
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
            });
            const $ = load(data);

            let googleURL = $('.r').first().find('a').first().attr('href');
            googleURL = parse(googleURL.replace('/url?', ''));
            const searchText = $('.st').first().text();
            const metadata = $('.r').first().text();
            initmsg.edit(
                new MessageEmbed()
                    .setColor(this.client.brandColor)
                    .setTimestamp()
                    .setAuthor('Google Search Results', this.client.user.displayAvatarURL())
                    .setFooter(this.client.user.username)
                    .setDescription(stripIndents`
                        [${metadata}](${googleURL.q})\n${searchText}
                    `)
            );
        } catch (error) {
            console.error(error);
            return initmsg.error('No results found.');
        }
        /* google.resultsPerPage = 5;
        google(query, (err, res) => {
            if (err) throw err;
            var links = res.links.filter(link => link.title !== 0 && link.link !== null && link.href !== null && link.description !== null);
            if (!links.length) return message.error(' No results!');
            const embed = new MessageEmbed()
                .setAuthor('Google', this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setDescription(`Results for "${query}"`)
                .setFooter(this.client.user.username);
            for (const link of links) {
                embed.addField(`${link.title.length < 500 ? link.title : 'Follow the link for more info.'} - ${link.link}`, link.description.length < 500 ? link.description : 'For more details, follow the link provided.');
            }
            message.send({ embed }).catch(err => message.send(err.message));
        });*/
    }

}
