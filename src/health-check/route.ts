import {Application} from "express";
import {HealthCheckController} from "./controller";

export class HealthCheckRoute {

    public healthCheckController: HealthCheckController = new HealthCheckController();

    public routes(app: Application): void {

        app.get('/healthz', this.healthCheckController.healthCheck );

    }
}
