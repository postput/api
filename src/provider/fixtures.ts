import {join} from 'path'
import {Fixtures} from "../fixtures";

export class StorageFixtures{

    static async load(){
        const dataDir = join(__dirname, '../../','data');
        //const storageTypeDir = join(dataDir, 'storage-type');
        const providerDir = join(dataDir, 'provider');
        const customStorageDir = join(providerDir, 'custom');
        const files = Fixtures.getFilesMatchingExtensionsInDirectories([providerDir, customStorageDir], '.json');
        await Fixtures.loadFiles(files);
    }
}
