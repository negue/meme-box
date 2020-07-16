import {createExpress} from "./express-server";
import {createWebSocketServer} from "./websocket-server";
import {EXPRESS_PORT, WS_PORT} from "./constants";


const expressServer = createExpress(EXPRESS_PORT);
const ws = createWebSocketServer(WS_PORT);
