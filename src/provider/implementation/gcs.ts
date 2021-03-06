import {oc} from "ts-optchain";
import {join} from "path";
import {writeFileSync} from "fs";
import PKGCloudProvider from "./pkgcloud";
import {ProviderConfig} from "../interface";

export default class GCSProvider extends PKGCloudProvider{

    defaultConfig: ProviderConfig = {
        custom: {
            provider: "google",
            keyFile: {
                "type": "service_account",
                "project_id": "pacific-cargo-6000",
                "private_key_id": "sd6f51fd6g51df65g16df5g1d6f51agdf6h51df",
                "private_key": "-----BEGIN PRIVATE KEY-----\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-----END PRIVATE KEY-----\n",
                "client_email": "pacific-cdfsdfsdf",
                "client_id": "555555555555555555555555555",
                "auth_uri": "https://accod",
                "token_uri": "https://accounts.d",
                "auth_provider_x509_cert_url": "https://wd",
                "client_x509_cert_url": "https://df"
            },
            container: "image-speaky",
            projectId: "pacific-cargo-701"
        },
        allowUpload: true,
        maxUploadSize: undefined,
        urls: ["http://localhost:2000/", "https://www.my-other-domain.com"]
    };

    getType(){
        return 'gcs';
    }

    init(): Promise<void> {
        const keyFile = oc(this.instance).config.custom.keyFile(null);
        if (keyFile) {
            const fullPath = join(__dirname, '../../../secret', this.instance.id + '.json');
            this.instance.config.custom.keyFilename = fullPath;
            writeFileSync(fullPath, JSON.stringify(keyFile));
        }


        return;
    }

}