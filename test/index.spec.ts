import {before, after} from 'mocha'
import App from "../src/app";

before(async () => {
    await App.instance.run();
});

after(async () => {
    App.instance.server.close()
});