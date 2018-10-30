class Song {

    constructor(client, info = {}) {
        this.title = info.title;
        this.author = info.author;
        this.length = info.length;
        this.thumbnail = info.thumbnail;
        this.url = info.url;
        this.requestedBy = info.requestedBy;
    }

}

export default Song;
