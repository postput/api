import {readdirSync} from "fs";
import {join} from "path";
import {ProviderService} from "./service";
import {Async} from "../helper/async";
import {ProviderInstance} from "./model";
import {Provider} from "./interface";

export class ProviderBuilder {
    private static pInstance: ProviderBuilder;
    providerClasses: any[];

    providers: Provider[] = [];

    static get instance(): ProviderBuilder {
        return ProviderBuilder.getInstance();
    }

    private static getInstance() {
        if (!ProviderBuilder.pInstance) {
            ProviderBuilder.pInstance = new ProviderBuilder();
        }
        return ProviderBuilder.pInstance;
    }

    async init() {
        const files = readdirSync(join(__dirname, 'implementation'));
        const providersPromises = files.map(async file => {
            const module = await import(join(__dirname, 'implementation', file));
            return module.default;
        });
        this.providerClasses = await Promise.all(providersPromises);

        const providerInstances = await ProviderService.instance.findAll();
        await Async.foreach(providerInstances, async providerInstance => {
            const provider = this.build(providerInstance);
            await provider.init();
        });

    }

    build(instance: ProviderInstance): Provider {
        if (instance.id && this.providers[instance.id]) {
            return this.providers[instance.id];
        }

        const Provider = this.providerClasses.find(provider =>
            provider.prototype.getType() === instance.type
        );
        if (Provider) {
            this.providers[instance.id] = new Provider(instance);
            return this.providers[instance.id];
        }
        throw Error('Provider "' + instance.type + '" not implemented.');
    }
}