export default class FoxPackage {

    public constructor(info = {}, guild) {
        this.name = info.name;
        this.description = info.description;
        this.enabled = null;
        this.guild = guild;
    }

    public async _setEnabled() {
        if (this.name === "Core") {
            this.enabled = true;
            return;
        }
        this.enabled = this.guild.config.packages ? this.guild.config.packages.includes(this.name) : false;
    }

    public async enable() {
        const query = await this.guild.client.mongo.guildconfig.findOne({ guildID: this.guild.id, type: "settings" });
        if (!query) return false;
        const arr = query.get("packages") || [];
        if (arr.indexOf(this.name) > -1) return false;
        arr.push(this.name);
        query.set({ packages: arr });
        await query.save();
        return true;
    }

    public async disable() {
        const query = await this.guild.client.mongo.guildconfig.findOne({ guildID: this.guild.id, type: "settings" });
        if (!query) return false;
        const packages = query.get("packages") || [];
        if (packages.indexOf(this.name) < 0) return true;
        packages.splice(packages.indexOf(this.name), 1);
        query.set({ packages });
        await query.save();
        return true;
    }

}
