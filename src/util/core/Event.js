class Event {

    constructor(client, info = {}) {
        this.name = info.name;
        this.description = info.description;
        this.enabled = info.enabled || true;
        this.client = client;
    }

    async run() {
        // defined in other classes
    }

}

export default Event;
