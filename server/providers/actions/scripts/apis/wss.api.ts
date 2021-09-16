import WebSocket, {Server} from 'ws';


export abstract class WebSocketServerApi {
  abstract createWSS(opt: {
    port: number
  }): Server

  abstract dispose();
}

export class RealWebSocketServer extends WebSocketServerApi {
  private createdServers: WebSocket.Server[] = [];

  createWSS(opt: { port: number }): WebSocket.Server {
    const server =  new Server({
      port: opt.port
    });

    this.createdServers.push(server);

    return server;
  }

  dispose() {
    for (const createdServer of this.createdServers) {
      createdServer.close();
    }
  }
}

export class DummyWebSocketServer extends WebSocketServerApi {
  createWSS(opt: { port: number }): WebSocket.Server {
    throw new Error('WebSocketServer can be only created inside a permanent script.')
  }

  dispose() {
  }
}
