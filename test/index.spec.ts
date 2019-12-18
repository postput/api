import {before, after} from 'mocha'
import App from "../src/app";

before(async function() {
    this.timeout(20000);
    await App.instance.run();
});

after(async function (){
    App.instance.server.close()
});