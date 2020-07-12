import {createExpress} from "./express-server";
import {createWebSocketServer} from "./websocket-server";


const WS_PORT = 4444;
const EXPRESS_PORT = 4445;

const expressServer = createExpress(EXPRESS_PORT);
const ws = createWebSocketServer(WS_PORT);
