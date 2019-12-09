const _ = require('lodash');

export class HealthCheckController {
    async healthCheck(req, res){
        res.sendStatus(200);
    }
}
