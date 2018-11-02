var userItems = {};

function makeStr(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

var cancelwords = ['cancel'];

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'shop',
            description: 'Spend your hard earned :cookie:',
            aliases: ['buy', 'store', 'cstore'],
            requiredPerms: ['`economy.banking`'],
            guildOnly: true
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('economy.banking', message);
    }

    async run(message) {
        let item = userItems[message.author.id];
        if (!item) {
            item = userItems[message.author.id] = { name: [] };
        }
        const myEntry = await this.client.mongo.banking.findOne({
            guildID: message.guild.id,
            userID: message.author.id
        });

        const filter = m => m.author.id === message.author.id;
        message.reply('Welcome to the shop! What would you like to do today? Available options: buy, show items\nThis command will be automatically cancelled in 60 seconds, or by you typing `cancel`.');
        const response = await message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] }).catch(() => null);
        if (!response) return message.reply('Time was up, so I cancelled the command.');
        if (response.first().content.match(/cancel/i)) return message.reply('Cancelling command now.');
        switch (response.first().content) {
        case 'buy':

            const items = await bankitems.sort('price', 'asc').find();
            const embed = new MessageEmbed()
                .setTitle(`Available items for ${message.guild.name}:`)
                .setDescription(`What would you like to buy? You have ¥${myEntry.get('money').toLocaleString()} to spend.\n\n${items.map(c => `${c.get('item')}: ¥${c.get('price').toLocaleString()}\n`).join(' ') || 'No items are on sale. Welp.'}`)
                .setColor('RANDOM');
            message.send({ embed });

            const collected = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] }).catch(() => null);
            if (!collected) return message.send('Cancelling command now.');

            if (cancelwords.includes(collected.first().content)) return message.reply('Successfully exited the store. Have a nice day!');
            if (collected.first().content === 'Custom Role' && !message.guild.me.hasPermission('MANAGE_ROLES')) return message.reply('I don\'t have proper permissions to manage roles. Please have a server admin grant me the Manage Roles permission first.');
            const myItem = await bankitems.findOne({ item: collected.first().content });
            if (!myItem) return message.reply('Sorry, but that item isn\'t available in my store. Make sure you\'ve spelled the item name correctly (case-sensitive) and try again.');
            const remaining = myEntry.get('money') - myItem.get('price');
            if (myEntry.get('money') - myItem.get('price') < 0) return message.reply('Sorry, you don\'t have enough :yen: to make this purchase.');
            item.name.push(collected.first().content);
            message.reply(`Are you sure you want to buy ${item.name[0]} for $${myItem.get('price').toLocaleString()}? You will have ¥${remaining.toLocaleString()} remaining. Reply yes to confirm, anything else to cancel.`);
            const confirmation = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] });

            if (confirmation.first().content !== 'yes') return message.reply('Cancelled command.');
            var newInt = myEntry.get('money') - myItem.get('price');
            const purchase = await this.client.mongo.banking.findOne({
                guildID: message.guild.id,
                userID: message.author.id
            });
            try {
                await myEntry.unset('money');
                purchase.set('money', newInt);
                await myEntry.save();
                purchase.save();
                item.name.push(makeStr(7));
            } catch (e) {
                console.error(e);
            }

            const newPurchase = new bankpurchases({
                guildID: message.guild.id,
                purchaser: message.author.id,
                item: item.name[0],
                price: myItem.get('price'),
                code: item.name[1],
                redeemed: false
            });
            await newPurchase.save();
            await message.reply(`Success! You have bought **${item.name[0]}** for **¥${myItem.get('price').toLocaleString()}**.`).then(() => message.author.send(`Thank you for purchasing **${item.name[0]}**! To redeem this item, just run the redeem command and enter this code when prompted: ${item.name[1]}`));
            item.name.splice(0, item.name.length);
            break;

        case 'show items':
            const shopStuff = await bankitems.sort('price', 'asc').find();
            const embedded = new MessageEmbed()
                .setAuthor(`Available items for ${message.guild.name}:`, message.guild.iconURL())
                .setTimestamp()
                .setColor('RANDOM')
                .setDescription(shopStuff.map(c => `${c.get('item')}, ¥${c.get('price').toLocaleString()}\n`).join(' ') || 'No items are on sale. Welp.');
            message.send({ embed: embedded });
            break;

        default: return message.error(' Sorry, that wasn\'t a recognized option.');
        }
    }

}
