import appConfig from './config/app';
import App from './app';
const app = App.instance;
app.express.listen(appConfig.listen_port, () => console.log("Server running on "+ appConfig.listen_port +"!"));
