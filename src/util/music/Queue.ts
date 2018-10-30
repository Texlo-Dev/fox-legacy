class Queue {

    public constructor(client, info) {
        this.client = client;
        this.textChannel = info.textChannel;
        this.voiceChannel = info.voiceChannel;
        this.connection = info.connection;
        this.songs = info.songs;
        this.skippers = info.skippers;
        this.playing = info.playing;
    }

    public async skip(member) {
        const serverQueue = member.guild.queue;
        if (!serverQueue) return this.textChannel.send("<:nicexmark:495362785010647041>  Sorry, but there was nothing playing for me to skip.");
        if (serverQueue.skippers.includes(member.id)) return this.textChannel.send("<:nicexmark:495362785010647041>  Sorry, but you have already voted to skip!");
        await serverQueue.skippers.push(member.id);
        if (serverQueue.skippers.length > Math.floor(member.voice.channel.members.size - 1) / 3) {
            serverQueue.connection.dispatcher.end();
            return this.textChannel.send("<:check:314349398811475968> Successfully skipped the current song.");
        } else {
            this.textChannel.send(`<:check:314349398811475968> Your skip has been added! To complete the skip, you need ${Math.ceil((member.voice.channel.members.size - 1) / 2) - serverQueue.skippers.length} more votes.`);
        }
    }

    public endAllSongs() {
        const serverQueue = this.textChannel.guild.queue;
        // Check if there are songs in queue to stop.
        // Doesn't use brackets because Jacz has weird formatting.
        if (!serverQueue.songs.length) return this.textChannel.send("<:nicexmark:495362785010647041>  There is nothing playing for me to stop.");
        serverQueue.songs = [];
        if (!serverQueue.connection) return null;
        serverQueue.connection.dispatcher.end();
        return true;
    }

    public pause() {
        try {
            this.textChannel.guild.voiceConnection.dispatcher.pause();
            return this.textChannel.send(" <:away:313956277220802560> Successfully paused the current song.");
        } catch (err) {
            return this.textChannel.send(`Oops, there was an error! ${err}`);
        }
    }

    public resume() {
        try {
            this.textChannel.guild.voiceConnection.dispatcher.resume();
            return this.textChannel.send(" <:away:313956277220802560> Successfully resumed the current song.");
        } catch (err) {
            return this.textChannel.send(`Oops, there was an error! ${err}`);
        }
    }

}

export default Queue;
