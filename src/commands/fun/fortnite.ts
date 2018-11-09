import { MessageEmbed } from "discord.js";
import { get } from "snekfetch";
import { Command } from "../../util";

const platforms = ["pc", "xbox", "ps4"];

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "fortnite",
            description: "Shows fortnite status",
        });
    }

    public async run(msg, [platform, ...name]) {
        if (!platform) { return msg.send(`<:nicexmark:495362785010647041>  You must specify a platform. Valid platforms: ${platforms.join(" ")}`); }
        if (!platforms.includes(platform)) { return msg.send(`<:nicexmark:495362785010647041>  You must specify a valid platform. Valud platforms: ${platforms.join(" ")}`); }
        if (name.length == 0) { return msg.send("<:nicexmark:495362785010647041>  You must specify a name!"); }

        get(`https://api.fortnitetracker.com/v1/profile/${platform}/${name}`).set("TRN-Api-Key", "85f6a824-58c4-4080-8678-ca4f9df5187b").then(res => {
            if (!res.body.stats) { return msg.send("<:nicexmark:495362785010647041>  This user has no fortnite status!"); }
            const solo = res.body.stats.p2,
                duo = res.body.stats.p10,
                squad = res.body.stats.p9,
                all = res.body.lifeTimeStats,
                match = res.body.recentMatches[0];

            const embed = new MessageEmbed()
                .setAuthor(`Fortnite - ${name}`, "https://pbs.twimg.com/profile_images/1017458813199372289/QtGv1tyn_400x400.jpg")
                .setColor(0x551a8b)
                .setTimestamp()
                .addField("All", `**Matches**: ${getVal(all, "Matches Played")}\n**Wins**: ${getVal(all, "Wins")}\n**Kills**: ${getVal(all, "Kills")} (KD: ${getVal(all, "K/d")})\n**Top 3**: ${getVal(all, "Top 3s")}\n**Top 5**: ${getVal(all, "Top 5s")}\n**Top 10**: ${getVal(all, "Top 10")}\n**Top 25**: ${getVal(all, "Top 25s")}`, true)
                .addField("Solo", `**Matches**: ${solo.matches.displayValue}\n**Wins**: ${solo.top1.displayValue} (WR: ${solo.winRatio.displayValue}%)\n**Kills**: ${solo.kills.displayValue} (KD: ${solo.kd.displayValue})\n**Top 3**: ${solo.top3.displayValue}\n**Top 5**: ${solo.top5.displayValue}\n**Top 10**: ${solo.top10.displayValue}\n**Top 25**: ${solo.top25.displayValue}`, true)
                .addField("Duo", `**Matches**: ${duo.matches.displayValue}\n**Wins**: ${duo.top1.displayValue} (WR: ${duo.winRatio.displayValue}%)\n**Kills**: ${duo.kills.displayValue} (KD: ${duo.kd.displayValue})\n**Top 3**: ${duo.top3.displayValue}\n**Top 5**: ${duo.top5.displayValue}\n**Top 10**: ${duo.top10.displayValue}\n**Top 25**: ${duo.top25.displayValue}`, true)
                .addField("Squad", `**Matches**: ${squad.matches.displayValue}\n**Wins**: ${squad.top1.displayValue} (WR: ${squad.winRatio.displayValue}%)\n**Kills**: ${squad.kills.displayValue} (KD: ${squad.kd.displayValue})\n**Top 3**: ${squad.top3.displayValue}\n**Top 5**: ${squad.top5.displayValue}\n**Top 10**: ${squad.top10.displayValue}\n**Top 25**: ${squad.top25.displayValue}`, true)
                .addField("Last Match", `**Playlist**: ${match.playlist === "p2" ? "Solo" : match.playlist === "p10" ? "Duo" : "Squad"}\n**Kills**: ${match.kills}\n**Minutes Played**: ${match.minutesPlayed}\n**Score**: ${match.score}`, true)
                .setFooter("Powered by fortnitetracker.com");

            msg.send(embed);
        });
    }

}

function getVal(arr, prop) {
    const mapped = arr.map(e => e.key === prop);
    let idx;

    for (idx = 0; idx < arr.length; idx++) {
        if (mapped[idx] === true) { return parseFloat(arr[idx].value).toLocaleString(); }
    }
}
