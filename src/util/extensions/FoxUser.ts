import { Structures, User } from "discord.js";
import { FoxClient } from "..";
import { Patrons } from "../Mongo";

export default Structures.extend("User", (u) => {
    class FoxUser extends User {
        public patreonTier: number;
        public upvoter: boolean;

        public constructor(...args) {
            super(...args);
            this.upvoter = undefined;
            this.patreonTier = undefined;
        }

        public async _setTier(): Promise<number> {
            const client: FoxClient = this.client as FoxClient;
            const tier: Patrons = await client.mongo.patrons.findOne({ userID: this.id });
            if (!tier) { this.patreonTier = 0; } else { this.patreonTier = tier.get("tier"); }

            return this.patreonTier;
        }

        public async _setUpvoter(): Promise<boolean> {
            const client: FoxClient = this.client as FoxClient;
            const upvote: boolean = await client.isUpvoter(this.id);
            this.upvoter = upvote;

            return upvote;
        }

        public async addPatreon(tier: number): Promise<boolean> {
            this.patreonTier = tier;
            const client: FoxClient = this.client as FoxClient;
            const user: Patrons = await client.mongo.patrons.findOne({ userID: this.id });
            if (!user) {
                const entry: Patrons = new client.mongo.patrons({
                    userID: this.id,
                    tier,
                });
                await entry.save();
            } else {
                user.set({ tier });
                await user.save();
            }

            return true;
        }

        public async removePatreon(): Promise<boolean> {
            this.patreonTier = 0;
            const client: FoxClient = this.client as FoxClient;
            await client.mongo.patrons.remove({ userID: this.id });

            return true;
        }

    }
    return FoxUser;
});
