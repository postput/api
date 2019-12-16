import PKGCloudProvider from "./pkgcloud";
import {ProviderConfig} from "../model";


export default class RackspaceProvider extends PKGCloudProvider{

    static type = 'rackspace';

    defaultConfig: ProviderConfig = {
        custom: {
            provider: "rackspace",
            storageAccount: "my-storage-account",
            storageAccessKey: "qsgfd5g6sd5hg468gfd4h65fgn1gf6n5s6gfh4s6d4hsd5fb31xvcb6s6fgh45fgsh==",
            container: "mycontainer"
        },
        allowUpload: true,
        maxUploadSize: undefined,
        urls: ["http://localhost:2000/", "https://www.my-other-domain.com"]
    };

}