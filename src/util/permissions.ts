
/*module.exports = message => {
    if (message.guild && message.member) {
        const FoxPermissions = require('./permissions/FoxPermissions');
        message.member.perm = new FoxPermissions(message);
         message.member.perm.has = permission => {
            if (!message.guild.permissions && message.guild.owner === message.author.id) return true;
            if (!message.guild.permissions && message.client.isOwner(message.author.id)) return true;
            if (!message.guild.permissions) return false;
            if (!message.guild.permissions.get(permission)) return false;
            let perm = message.guild.permissions.get(permission).members;
            if (!perm) return false;
            let included = message.member.roles.some(role => perm.includes(role.id));
            return perm.includes(message.author.id) || included;
        };

        message.member.perm.set = async (permission, snowflake) => {
            console.log(`${permission}, ${snowflake}`);
            let perms = await permissions.findOne({guildID: message.guild.id});
            if (!perms) return message.reply('Please type `initperm` in a server channel first to get started.');
            leet arr = perms.get(permission);
            if (!arr) return message.reply(`That wasn't a valid permission.`);
            if (arr.includes(snowflake)) return null;
            arr.push(snowflake);
            perms.set(permission, arr);
            perms.save();
            return message.guild.permissions.get(permission);
        };

        message.member.perm.remove = async (permission, snowflake) => {
            console.log(`${permission}, ${snowflake}`);
            let perms = await permissions.findOne({guildID: message.guild.id});
            if (!perms) return message.reply('Please type `initperm` in a server channel first to get started.');
            let arr = perms.get(permission);
            if (!arr) return message.reply(`That wasn't a valid permission.`);
            if (!arr.includes(snowflake)) return null;
            arr.splice(arr.indexOf(snowflake), 1);
            perms.set(permission, arr);
            perms.save();
            return message.guild.permissions.get(permission);
        };
    }*/
}
