class Event {

    public constructor(client, info = {}) {
        this.name = info.name;
        this.description = info.description;
        this.enabled = info.enabled || true;
        this.client = client;
    }

    public async run() {
        // defined in other classes
    }

}

export default Event;
