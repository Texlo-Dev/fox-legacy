import { Structures } from 'discord.js';
export default Structures.extend('GuildMember', member => {
    class FoxMember extends member {

        constructor(...args) {
            super(...args);
            this.is = true;
        }

    }
    return FoxMember;
});
