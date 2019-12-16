import {ProviderConfig} from '../model'
import PKGCloudProvider from "./pkgcloud";

export default class OpenstackProvider extends PKGCloudProvider{

    static type = 'openstack';

    defaultConfig: ProviderConfig = {
        custom: {
            provider: "google",
            username: "wxc6v5wxc65v",
            password: "fsdf6sqd6f54qs6d5f4fd6g54df654",
            tenantId: "wxc6v5wx6c5v46w5cx4v65w4xb654vcb",
            region: "BHS",
            authUrl: "https://auth.cloud.ovh.net/",
            version: "v3.0",
            container: "test"
        },
        allowUpload: true,
        maxUploadSize: undefined,
        urls: ["http://localhost:2000/", "https://www.my-other-domain.com"]
    };

}