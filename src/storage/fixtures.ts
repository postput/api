import {join} from 'path'
import {Fixtures} from "../fixtures";

export class StorageFixtures{

    static async load(){
        const dataDir = join(__dirname, '../../','data');
        const storageTypeDir = join(dataDir, 'storage-type');
        const storageDir = join(dataDir, 'storage');
        const customStorageDir = join(storageDir, 'custom');
        const files = Fixtures.getFilesMatchingExtensionsInDirectories([storageTypeDir, storageDir, customStorageDir], '.json');
        await Fixtures.loadFiles(files);
    }
}
