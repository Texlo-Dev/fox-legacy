import { Structures } from "discord.js";

export default Structures.extend("User", User => {
    class FoxUser extends User {

        public constructor(...args) {
            super(...args);
            this.upvoter = null;
            this.patreonTier = null;
        }

        public async _setUpvoter() {
            const upvote = await this.client.isUpvoter(this.id);
            this.upvoter = upvote;
            return upvote;
        }

        public async addPatreon(tier) {
            this.patreonTier = tier;
            const user = await this.client.mongo.patrons.findOne({ userID: this.id });
            if (!user) {
                const entry = new this.client.mongo.patrons({
                    userID: this.id,
                    tier: tier
                });

                await entry.save();
            } else {
                user.set({ tier: tier });
                await user.save();
            }
            return true;
        }

        public async removePatreon() {
            this.patreonTier = 0;
            await this.client.mongo.patrons.remove({ userID: this.id });

            return true;
        }

        public async _setTier() {
            const tier = await this.client.mongo.patrons.findOne({ userID: this.id });
            if (!tier) this.patreonTier = 0;
            else this.patreonTier = tier.get("tier");

            return this.patreonTier;
        }

    }

    return FoxUser;
});
