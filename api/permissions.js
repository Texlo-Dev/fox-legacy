import polka from 'polka';
import authMiddleware from '../util/authMiddleware';
const router = polka();

router.get('/', async (req, res) => {
    const prepObj = async () => {
        const obj = {};
        req.client.permissions.forEach(perm => {
            const cat = perm.category;
            if (!obj.hasOwnProperty(cat)) obj[cat] = [];
            obj[cat].push(perm);
        });
        return obj;
    };
    const help = await prepObj();
    res.json(200, help);
});

router.get('/:guildID', authMiddleware, async (req, res) => {
    const { guildID } = req.params;
    try {
        const resp = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.perms.array();
            }
        `).catch(err => { throw err; });
        if (!resp.filter(g => g)) throw new Error('Could Not resolve guild.');
        res.json(200, resp.filter(g => g)[0]);
    } catch (error) {
        res.json(500, { error: error.message });
    }
});

router.patch('/:guildID', authMiddleware, async (req, res) => {
    const { perm, status, target } = req.body;
    const { guildID } = req.params;
    if (!target) return res.json(400, { error: 'Missing or invalid parameters.' });
    try {
        const resp = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.perms.set('${perm}', ${JSON.stringify(target)}, '${status}').then(r => r);
            }
        `).catch(err => { throw err; });
        if (!resp.filter(g => g)) throw new Error('Could Not resolve guild.');
        res.json(200, resp.filter(g => g)[0]);
    } catch (error) {
        res.json(500, { error: error.message });
    }
});

router.delete('/:guildID/:targetID', authMiddleware, async (req, res) => {
    const { targetID, guildID } = req.params;
    if (!targetID) return res.json(400, { error: 'Missing or invalid parameters.' });
    try {
        const resp = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.perms.delete('${targetID}').then(r => r);
            }
        `).catch(err => { throw err; });
        if (!resp.filter(g => g)) throw new Error('Could Not resolve guild.');
        res.json(200, resp.filter(g => g)[0]);
    } catch (error) {
        res.json(500, { error: error.message });
    }
});
export default router;
