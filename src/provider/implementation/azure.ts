import PKGCloudProvider from "./pkgcloud";
import {ProviderConfig} from "../model";

export default class AzureProvider extends PKGCloudProvider{

    static type = 'azure';

    defaultConfig: ProviderConfig = {
        custom: {
            provider: "azure",
            storageAccount: "my-storage-account",
            storageAccessKey: "qsgfd5g6sd5hg468gfd4hdfgdfgdghjkhljkmloklmvcb6s6fgh45fgsh==",
            container: "mycontainer"
        },
        allowUpload: true,
        maxUploadSize: undefined,
        urls: ["http://localhost:2000/", "https://www.my-other-domain.com"]
    };

}