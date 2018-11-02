interface PollOptions {
    name: string;
    type: string;
    channel: any;
    messageID: string;
    question: string;
    open: boolean;
    responses: any[];
}
export default class Poll {
    public name: string;
    public type: string;
    public channel: any;
    public messageID: string;
    public question: string;
    public open: boolean;
    public responses: any[];

    public constructor(options: PollOptions) {
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
