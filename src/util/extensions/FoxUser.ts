import { Structures, User } from "discord.js";
import { FoxClient } from "..";
import { Patrons } from "../Mongo";

export default Structures.extend("User", u => {
    class FoxUser extends User {
        public upvoter: boolean;
        public patreonTier: number;

        public constructor(...args) {
            super(...args);
            this.upvoter = null;
            this.patreonTier = null;
        }

        public async _setUpvoter(): Promise<boolean> {
            const client = this.client as FoxClient;
            const upvote = await client.isUpvoter(this.id);
            this.upvoter = upvote;
            return upvote;
        }

        public async addPatreon(tier: number): Promise<boolean> {
            this.patreonTier = tier;
            const client = this.client as FoxClient;
            const user: Patrons = await client.mongo.patrons.findOne({ userID: this.id });
            if (!user) {
                const entry: Patrons = new client.mongo.patrons({
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

        public async removePatreon(): Promise<boolean> {
            this.patreonTier = 0;
            const client = this.client as FoxClient;
            await client.mongo.patrons.remove({ userID: this.id });
            return true;
        }

        public async _setTier(): Promise<number> {
            const client = this.client as FoxClient;
            const tier = await client.mongo.patrons.findOne({ userID: this.id });
            if (!tier) this.patreonTier = 0;
            else this.patreonTier = tier.get("tier");
            return this.patreonTier;
        }

    }
    return FoxUser;
});
