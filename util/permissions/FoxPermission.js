export default class FoxPermission {

    constructor(client, data = {}) {
        this.name = data.name;
        this.description = data.description;
        this.category = data.category;
    }

}
