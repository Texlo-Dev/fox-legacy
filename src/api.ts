import cors from 'cors';
import polka from 'polka';
import { json as _json, urlencoded } from 'body-parser';
import respond from '@polka/send-type';
const app = polka();

export default client => {
    app.use(cors());
    app.use(_json());
    app.use(urlencoded());

    app.use((req, res, next) => {
        req.client = client;
        res.json = (code, json) => {
            respond(res, code, json);
        };
        next();
    });

    app.use('/api', require('./api/').default);
    app.listen(17428, () => {
        console.log(`> Mr.Fox API running at *:17428`);
    });
};

