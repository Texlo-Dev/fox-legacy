export default class FoxPermission {

    public constructor(client, data = {}) {
        this.name = data.name;
        this.description = data.description;
        this.category = data.category;
    }

}
