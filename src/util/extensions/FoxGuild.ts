import { Collection, Structures } from "discord.js";
import {
  Banking,
  Config,
  CustomCommands,
  FoxClient,
  FoxPermission,
  GiveawayStore,
  Leveling,
  Package,
  PermStore,
  PollStore as Polls,
  ServerProtect,
  TicketStore
} from "..";

import { readdir } from "fs-nextra";
import { Permissions } from "../Mongo";

export default Structures.extend("Guild", guild => {
  class FoxGuild extends guild {
    public banking: Banking;
    public commands: CustomCommands;
    public config: Config;
    public giveaways: GiveawayStore;
    public leveling: Leveling;
    public packages: Collection<any, Package>;
    public permissions: Collection<any, FoxPermission>;
    public perms: PermStore;
    public polls: Polls;
    public queue: any;
    public serverprotect: ServerProtect;
    public tickets: TicketStore;

    public constructor(...args: any) {
      // @ts-ignore
      super(...args);
      this.permissions = new Collection();
      this.perms = new PermStore(this as any);
      this.packages = new Collection();
      this.serverprotect = new ServerProtect(this as any, {
        maxwarn: 5,
        maxban: 9
      });
      this.queue = null;
      
      this.leveling = new Leveling(this as any);
      this.banking = new Banking(this as any);
      this.polls = new Polls(this as any);
      this.giveaways = new GiveawayStore(this as any);
      this.config = new Config(this as any);
      this.commands = new CustomCommands(this as any);
      this.tickets = new TicketStore(this as any);
      this._getPackages();
    }

    public async _getPackages(): Promise<void> {
      const folders: string[] = await readdir(
        `${process.cwd()}/build/commands/`
      );
      for (const folder of folders) {
        const files: string[] = await readdir(
          `${process.cwd()}/build/commands/${folder}/`
        );
        for (const file of files) {
          if (!file.startsWith("pkg")) {
            continue;
          }
          const config: any = await import(`${process.cwd()}/build/commands/${folder}/${file}`);
          const pkg: Package = new Package(config, this);
          this.packages.set(pkg.name, pkg);
        }
      }
    }

    public async fetchPackages(): Promise<object> {
      const promises: any = this.packages.map(async p => p._setEnabled());

      return new Promise(r => {
        Promise.all(promises).then(() => setTimeout(() => r(this), 100));
      });
    }

    public async refreshPerms(): Promise<void> {
      const permfind: any[] = await (this
        .client as FoxClient).mongo.permissions.find();
      let perms: any[] = permfind.map((perm: Permissions) => perm.get());
      perms = perms.sort((p, c) =>
        p.category > c.category
          ? 1
          : p.name > c.name && p.category === c.category
          ? 1
          : -1
      );
      await this.permissions.clear();
      for (const perm of perms) {
        const foxperm: FoxPermission = new FoxPermission(
          this.client as FoxClient,
          perm
        );
        this.permissions.set(foxperm.name, foxperm);
      }
    }
  }

  return FoxGuild;
});
