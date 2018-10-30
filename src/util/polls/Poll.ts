export default class Poll {

    public constructor(options) {
        this.name = options.name;
        this.type = options.type;
        this.channel = options.channel;
        this.messageID = options.messageID;
        this.question = options.question;
        this.open = options.open;
        this.responses = options.responses;
    }

    public end() {

    }

}
