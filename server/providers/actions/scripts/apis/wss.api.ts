import WebSocket, {Server} from 'ws';


export abstract class WebSocketServerApi {
  abstract createWSS(opt: {
    port: number
  }): Server

  abstract connect(address: string, options?: WebSocket.ClientOptions): WebSocket;

  abstract dispose();
}

export class RealWebSocketServer extends WebSocketServerApi {
  private createdServers: WebSocket.Server[] = [];
  private createdClients: WebSocket[] = [];


  createWSS(opt: { port: number }): WebSocket.Server {
    const server =  new Server({
      port: opt.port
    });

    this.createdServers.push(server);

    return server;
  }

  connect(address: string, options?: WebSocket.ClientOptions): WebSocket {
    const client = new WebSocket(address, options);

    this.createdClients.push(client);

    return client;
  }

  dispose(): void  {
    for (const createdServer of this.createdServers) {
      createdServer.close();
    }

    for (const createdClient of this.createdClients) {
      createdClient.close();
    }
  }
}

export class DummyWebSocketServer extends WebSocketServerApi {
  createWSS(opt: { port: number }): WebSocket.Server {
    throw new Error('WebSocketServer can be only created inside a permanent script.')
  }

  dispose(): void  {
  }

  connect(address: string, options?: WebSocket.ClientOptions): WebSocket {
    throw new Error('WebSocket connect can be only used inside a permanent script.')
  }
}
