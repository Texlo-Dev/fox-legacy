import { Injectable } from "@nestjs/common";
import { FoxClient } from "../util";
import { EvalContext } from "./types/evalcontext";
@Injectable()
export class FoxService {
  public async botEval(
    foxclient: FoxClient,
    guild: string,
    script: string
  ): Promise<any> {
    try {
      const guildcheck: string = `
      const guild = this.guilds.get('${guild}');
      `;
      const res: any[] = await foxclient.shard.broadcastEval(
        guildcheck + script
      );
      const filtered: any = res.filter(r => r)[0];

      return filtered;
    } catch (error) {
      throw error;
    }
  }
  // tslint:disable:cyclomatic-complexity
  public async evalContext(
    context: EvalContext,
    client: FoxClient,
    args: any
  ): Promise<any> {
    const { guild, ...meta } = args;
    let script: string;
    switch (context) {
      case "ADD_COMMAND": {
        script = `if (guild) {
          guild.commands.add(${JSON.stringify(meta.data)}).then(r => r)
        }`;
        break;
      }
      case "ADD_GIVEAWAY": {
        script = `if (guild) { guild.giveaways.add('${decodeURIComponent(
          meta.name
        )}', ${JSON.stringify(meta.data)}).then(r => r)}`;
        break;
      }

      case "ADD_POLL": {
        script = `if (guild) {
          guild.polls.add('${decodeURIComponent(meta.name)}', ${JSON.stringify(
          meta.data
        )}).then(r => r)
        }`;
        break;
      }

      case "ADD_PERMISSION": {
        script = `if (guild) {
          guild.perms.add('${meta.perm}', ${JSON.stringify(meta.target)}, '${
          meta.status
        }').then(r => r);
        }`;
        break;
      }

      case "ADD_TICKET": {
        script = `if (guild) {
          guild.tickets.save('${meta.key}', ${
          meta.bool ? meta.value : JSON.stringify(meta.value)
        }).then(r => r)
        }`;
        break;
      }

      case "DELETE_COMMAND": {
        script = `if (guild) {
          guild.commands.remove('${decodeURIComponent(
            meta.command
          )}').then(r => r)
        }`;
        break;
      }

      case "DELETE_GIVEAWAY": {
        script = `if (guild) {
          guild.giveaways.remove('${decodeURIComponent(
            meta.name
          )}').then(r => r);
        }`;
        break;
      }

      case "DELETE_PERMISSION": {
        script = `if (guild) {
          guild.perms.remove('${meta.target}').then(r => r);
        }`;
        break;
      }

      case "DELETE_POLL": {
        script = `if (guild) {
          guild.polls.remove('${decodeURIComponent(meta.name)}').then(r => r)
        }`;
        break;
      }

      case "GET_SETTINGS": {
        script = "if (guild) { guild.config }";
        break;
      }

      case "GET_PERMISSIONS": {
        script = "if (guild) { guild.perms.array() }";
        break;
      }

      case "GET_GIVEAWAYS": {
        script =
          "if (guild) { guild.giveaways._cache().then(() => guild.giveaways.array())}";
        break;
      }

      case "GET_TICKETS": {
        script = "if (guild) { guild.tickets._cache().then(tkts => tkts)}";
        break;
      }

      case "GET_CHANNELS": {
        script = `
          if (guild) {
          guild.channels
          .filter(c =>
              c.permissionsFor(this.user.id)
              .has(["SEND_MESSAGES", "MANAGE_MESSAGES", "VIEW_CHANNEL"])
              && c.type === (${meta.category} ? 'category' : 'text'))
          .array()
          .sort();}`;
        break;
      }

      case "GET_ROLES": {
        script = `
        guild.roles
        .sort((c, d) => c.position - d.position)
        .filter(r =>
            ${meta.all}
            ? r.name !== "@everyone" && !r.managed
            : r.position < guild.me.roles.highest.position && r.name !== "@everyone" && !r.managed)
        .array();`;
        break;
      }

      case "GET_EMOJIS": {
        script = "if (guild) { guild.emojis.array(); }";
        break;
      }

      case "GET_LEVELING": {
        script =
          "if (guild) { guild.leveling._loadSettings().then(() => guild.leveling.minify())}";
        break;
      }

      case "GET_PACKAGES": {
        script = "if (guild) { guild.packages }";
        break;
      }

      case "GET_POLLS": {
        script = "if (guild) { guild.polls.array() }";
        break;
      }

      case "GET_BANKING": {
        script =
          "if (guild) { guild.banking._loadSettings().then(() => guild.banking.minify())}";
        break;
      }

      case "GET_COMMANDS": {
        script = "if (guild) { guild.commands.array() }";
        break;
      }

      case "PATCH_COMMAND": {
        script = `if (guild) {
          const command = guild.commands.get('${decodeURIComponent(
            meta.command
          )}');
          if (!command) Promise.reject('The provided command does not exist.');
          command.edit(${JSON.stringify(meta.data)}).then(r => r);
        }`;
      }

      case "PATCH_GIVEAWAY": {
        script = `if (guild) {
          const giveaway = guild.giveaways.get('${meta.name}');
          if (!giveaway) throw new Error('Invalid giveaway name.');
          if ('${meta.action}' === 'reroll') {
            giveaway.reroll().then(r => r);
          } else if ('${meta.action}' === 'end') {
          giveaway.end().then(r => r);
          } else if ('${meta.action}' === 'pause') {
            giveaway.pause().then(r => r);
          } else if ('${meta.action}' === 'resume') {
            giveaway.resume().then(r => r);
          }
        }`;
        break;
      }

      case "PATCH_POLL": {
        script = `if (guild) {
          const poll = guild.polls.get('${meta.name}');
          if (!poll) throw new Error('Invalid polls name.');
          if ('${meta.action}' === 'close') {
            guild.polls.gatherData(poll).then(r => r);
          }
        }`;
        break;
      }

      case "PATCH_LEVELING": {
        script = `if (guild) {
          guild.leveling.set('${meta.key}', ${
          meta.bool ? meta.value : JSON.stringify(meta.value)
        }).then(r => r)
        }`;
        break;
      }

      case "PATCH_BANKING": {
        script = `if (guild) {
          guild.banking.set('${meta.key}', ${
          meta.bool ? meta.value : JSON.stringify(meta.value)
        }).then(r => r)
        }`;
        break;
      }

      case "TOGGLE_SETTING": {
        script = `if (guild) {
          guild.config.set('${meta.key}', ${
          meta.bool ? meta.value : JSON.stringify(meta.value)
        }).then(r => r);
        }`;
        break;
      }

      case "TOGGLE_SETTING_ARRAY": {
        script = `if (guild) {
          guild.config.setArray('${meta.key}', ${JSON.stringify(
          meta.value
        )}, true).then(r => r);
        }`;
        break;
      }

      case "TOGGLE_PACKAGE": {
        script = `if (guild) {
          const pkg = guild.packages.get('${meta.pkg}');
          ${
            meta.enabled
          } ? pkg.enable().then(r => r) : pkg.disable().then(r => r);
        }`;
        break;
      }

      default:
        throw new TypeError(
          "Invalid context provided. Must be an EvalContext."
        );
    }

    return this.botEval(client, guild, script);
  }
}
