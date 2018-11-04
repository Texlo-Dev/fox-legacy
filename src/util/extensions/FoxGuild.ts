import { Collection, Guild, Structures } from "discord.js";
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
    PermStore,
    FoxClient
} from "..";

import { readdir } from "fs-nextra";
import { Permissions } from "../Mongo";

export default Structures.extend("Guild", guild => {
    class FoxGuild extends guild {
        public perms: PermStore;
        public config: Config;
        public readonly shard: number;
        public polls: Polls;
        public giveaways: GiveawayStore;
        public serverprotect: ServerProtect;
        public queue: any;
        public leveling: Leveling;
        public permissions: Collection<any, FoxPermission>;
        public banking: Banking;
        public packages: Collection<any, Package>;
        public commands: CustomCommands;

        public constructor(...args: any) {
            // @ts-ignore
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

        public async _getPackages(): Promise<void> {
            const folders: string[] = await readdir(`${process.cwd()}/build/commands/`);
            for (const folder of folders) {
                const files: string[] = await readdir(`${process.cwd()}/build/commands/${folder}/`);
                for (const file of files) {
                    if (!file.startsWith("pkg")) continue;
                    const config: any = await import(`${process.cwd()}/build/commands/${folder}/${file}`);
                    const pkg: Package = new Package(config, this);
                    this.packages.set(pkg.name, pkg);
                }
            }
        }

        public async fetchPackages(): Promise<object> {
            const promises = this.packages.map(async p => await p._setEnabled());
            return new Promise(r => {
                Promise.all(promises).then(() => setTimeout(() => r(this), 100));
            });
        }

        public async refreshPerms() {
            const permfind: any[] = await (this.client as FoxClient).mongo.permissions.find();
            let perms = permfind.map((perm: Permissions) => perm.get());
            perms = perms.sort((p, c) => p.category > c.category ? 1 : p.name > c.name && p.category === c.category ? 1 : -1);
            await this.permissions.clear();
            for (const perm of perms) {
                const foxperm: FoxPermission = new FoxPermission(this.client as FoxClient, perm);
                this.permissions.set(foxperm.name, foxperm);
            }
        }
    }
    return FoxGuild;
});
