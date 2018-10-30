import { Structures, Collection } from 'discord.js';
import {
    Banking,
    CustomCommands,
    Leveling,
    PollStore as Polls,
    FoxPermission,
    Package,
    GiveawayStore,
    Config,
    ServerProtect,
    PermStore
} from '../';

import { readdir } from 'fs-nextra';


export default Structures.extend('Guild', G => {
    class FoxGuild extends G {

        constructor(...args) {
            super(...args);
            this.permissions = new Collection();
            this.perms = new PermStore(this);
            this.packages = new Collection();
            this.serverprotect = new ServerProtect(this, {
                maxwarn: 5,
                maxban: 9
            });
            this.queue = null;
            this.shard = this.client.shard.id;
            this.leveling = new Leveling(this);
            this.banking = new Banking(this);
            this.polls = new Polls(this);
            this.giveaways = new GiveawayStore(this);
            this.config = new Config(this);
            this.commands = new CustomCommands(this);
            this._getPackages();
        }

        async _getPackages() {
            const folders = await readdir(`${process.cwd()}/commands/`);
            for (const folder of folders) {
                const files = await readdir(`${process.cwd()}/commands/${folder}/`);
                for (const file of files) {
                    if (!file.endsWith('.json')) continue;
                    const config = await import(`${process.cwd()}/commands/${folder}/${file}`);
                    const pkg = new Package(config.default, this);
                    this.packages.set(pkg.name, pkg);
                }
            }
        }

        async fetchPackages() {
            const promises = this.packages.map(async p => await p._setEnabled());
            return new Promise(r => {
                Promise.all(promises).then(setTimeout(() => r(this), 100));
            });
        }

        async allowPermission(permission, id, message) {
            const perm = await this.client.mongo.permissions.findOne({ name: permission });
            if (!perm && message) return message.error(' Sorry, but this permission doesn\'t exist.');
            const arr = perm.get('allowed');
            if (arr.indexOf(id) > -1) return false;
            const denied = perm.get('denied');
            if (denied.indexOf(id) > -1) denied.splice(denied.indexOf(id), 1);
            arr.push(id);
            perm.set({ allowed: arr, denied });
            await perm.save();
            await this.refreshPerms();
            return true;
        }

        async denyPermission(permission, id, message) {
            const perm = await this.client.mongo.permissions.findOne({ name: permission });
            if (!perm && message) return message.error(' Sorry, but this permission doesn\'t exist.');
            const arr = perm.get('denied');
            if (arr.indexOf(id) > -1) return false;
            const allowed = perm.get('allowed');
            if (allowed.indexOf(id) > -1) allowed.splice(allowed.indexOf(id), 1);
            arr.push(id);
            perm.set({ denied: arr, allowed });
            await perm.save();
            await this.refreshPerms();
            return true;
        }

        async refreshPerms() {
            const permfind = await this.client.mongo.permissions.find();
            let perms = permfind.map(perm => perm.get());
            perms = perms.sort((p, c) => p.category > c.category ? 1 : p.name > c.name && p.category === c.category ? 1 : -1);
            await this.permissions.clear();
            for (const perm of perms) {
                const foxperm = new FoxPermission(this.client, perm);
                this.permissions.set(foxperm.name, foxperm);
            }
        }

    }

    return FoxGuild;
});
