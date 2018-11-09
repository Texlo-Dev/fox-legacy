interface PollOptions {
    channel: any;
    messageID?: string;
    name: string;
    open: boolean;
    question: string;
    responses: any[];
    type: string;
}
export default class Poll implements PollOptions {
    public channel: any;
    public messageID: string;
    public name: string;
    public open: boolean;
    public question: string;
    public responses: any[];
    public type: string;

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
