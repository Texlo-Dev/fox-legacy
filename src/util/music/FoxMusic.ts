import { MessageEmbed } from "discord.js";
import ytdl from "ytdl-core";
import YoutubeAPI from "simple-youtube-api";
import { googleAPI as apikey } from "../../config.json";
const youtube = new YoutubeAPI(apikey);
import Song from "./Song";
import Queue from "./Queue";
import { duration } from "moment";

class FoxMusic {

    public constructor(client) {
        this.client = client;
    }

    public async getID(args, message, member) {
        if (args.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const times = [];
            const playlist = await youtube.getPlaylist(args);
            const videos = await playlist.getVideos();

            if (videos.length > 5 && !message.author.patreonTier) return message.error(` Sorry, but YouTube playlists are limited to 5 songs as a free user. To remove this limit, consider becoming a Patreon today, to recieve exclusive features, including enhanced music playback.\nhttps://www.patreon.com/foxdevteam`);

            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id);
                times.push(video2.durationSeconds);
                await this.handleVideo(video2, message, member, member.voice.channel, true);
            }

            const timeArr = times.map(t => parseInt(t));
            const time = timeArr.reduce((prev, val) => prev + val, 0);
            const embed = new MessageEmbed()
                .setAuthor(`Music`, this.client.user.displayAvatarURL())
                .setDescription(`Playlist **${playlist.title}** has been added to the queue!\nAuthor: **${playlist.channel.title}**\nLength: Around **${duration(time, "seconds").format("h [hours and] m [minutes].")}**`)
                .setColor(this.client.brandColor);
            message.send({ embed });
        } else {
            try {
                const video = await youtube.getVideo(args);
                return this.handleVideo(video, message, member, member.voice.channel);
            } catch (error) {
                try {
                    const videos = await youtube.searchVideos(args, 5);
                    let num = 0;
                    const embed = new MessageEmbed()
                        .setAuthor(`Music Selection`, this.client.user.displayAvatarURL())
                        .setDescription(`Here are the top 5 results for **${args}**:\n${videos.map(v => `**${++num}** - ${v.title} by ${v.channel.title}`).join("\n")}\n\nPlease enter a number from 1-5.`)
                        .setColor(this.client.brandColor)
                        .setTimestamp()
                        .setFooter(this.client.user.username);
                    message.send({ embed });
                    try {
                        let res = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                            max: 1,
                            time: 15000,
                            errors: ["time"]
                        });
                    } catch (error) {
                        return message.error(" Sorry, but that wasn't a valid selection.");
                    }
                    const index = parseInt(res.first().content);
                    const video = await youtube.getVideoByID(videos[index - 1].id);
                    res.first().delete();
                    return this.handleVideo(video, message, member, member.voice.channel);
                } catch (error) {
                    return message.error(" Sorry, I couldn't find any results.");
                }
            }
        }
    }

    public async play(guild, song) {
        const serverQueue = guild.queue;
        if (!song) {
            setTimeout(() => {
                serverQueue.voiceChannel.leave();
                serverQueue.textChannel.send("<:dnd:313956276893646850>  Queue is empty. Queue up some more tunes!");
                guild.queue = null;
            }, 1500);
            return;
        }
        serverQueue.skippers = [];
        console.log(song.url);
        const dispatcher = serverQueue.connection.play(ytdl(song.url, { filter: "audioonly" }), { bitrate: "auto" });
        const embed = new MessageEmbed()
            .setThumbnail(song.thumbnail)
            .setAuthor(`Music`, this.client.user.displayAvatarURL())
            .setDescription(`Now Playing: **${song.title}**\nAuthor: **${song.author}**\nLength: **${duration(song.length, "seconds").format("m:ss", { trim: false })}**`)
            .setColor(this.client.brandColor);
        serverQueue.textChannel.send({ embed });

        dispatcher.on("end", () => {
            serverQueue.songs.shift();
            setTimeout(() => this.play(guild, serverQueue.songs[0]), 2000);
        });
    }

    public async handleVideo(video, message, member, voiceChannel, playlist = false) {
        const upvoter = message.author.upvoter;
        const song = new Song(this.client, {
            id: video.id,
            title: video.title,
            author: video.channel.title,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            requestedBy: member,
            length: video.durationSeconds,
            thumbnail: video.thumbnails.standard ? video.thumbnails.standard.url : video.thumbnails.default.url
        });
        if (!playlist && parseInt(song.length) > 300 && !upvoter) return message.error(` Sorry, but the song length limit is currently at 4 minutes for a non-upvoter. In order to remove this limit, upvote Mr.Fox in Discord Bots List today, it's free! https://discordbots.org/bot/333985343445663749`);
        if (!playlist && parseInt(song.length) > 600 && !message.author.patreonTier) return message.error(` Sorry, but the song length limit is currently at 8 minutes for a free user. If you'd like to become a Patreon, where you will gain access to exclusive Patreon-onny features including music, visit our patreon page today and choose a plan that is right for you!\nhttps://www.patreon.com/foxdevteam`);
        if (!playlist && parseInt(song.length) > 1800 && message.author.patreonTier < 2) return message.error(` Sorry, but your current Patreon status does not allow for songs over 30 minutes. To listen to music longer than 30 minutes, please upgrade to a Silver Fox Patreon or higher.`);

        const serverQueue = message.guild.queue;
        if (!serverQueue) {
            const queueStruct = message.guild.queue = new Queue(this.client, {
                textChannel: message.channel,
                voiceChannel,
                connection: null,
                songs: [],
                skippers: [],
                playing: true
            });
            queueStruct.songs.push(song);

            try {
                const connection = await voiceChannel.join();
                queueStruct.connection = connection;
                this.play(message.guild, queueStruct.songs[0]);
            } catch (error) {
                message.guild.queue = null;
                return message.error(`Sorry, I couldn't join this voice channel: ${error}`);
            }
        } else {
            if (!playlist && serverQueue.songs.filter(song => song.requestedBy.id === message.author.id).length >= 3 && !message.author.patreonTier) return message.error(` Your song queue limit is currently at 3 songs as a free user. If you'd like to become a Patreon, where you will gain access to exclusive Patreon-ony features, visit our patreon page today and choose a plan that is right for you!\nhttps://www.patreon.com/foxdevteam`);
            if (!playlist && serverQueue.songs.filter(song => song.requestedBy.id === message.author.id).length > 8 && !message.author.patreonTier) return message.error(` Your song queue limit is currently at 8 songs as a Bronze Fox Patreon. To increase your queue limit, please upgrade to a Silver Fox Patreon or higher.`);
            serverQueue.songs.push(song);
            if (playlist) return;
            const embed = new MessageEmbed()
                .setThumbnail(song.thumbnail)
                .setAuthor(`Music`, message.client.user.displayAvatarURL())
                .setDescription(`Successfully added **${song.title}** to the queue!\nAuthor: **${song.author}**\nLength: **${duration(song.length, "seconds").format("m:ss", { trim: false })}**`)
                .setColor(this.client.brandColor);
            message.send({ embed });
        }
    }

}

export default FoxMusic;
