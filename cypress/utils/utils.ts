import {Server, WebSocket} from "mock-socket"

interface SocketPair {
  mockServer: Server;
  socket?: WebSocket;
}

const sockets: SocketPair[] = [];

export function initServer() {
  // useful to reset sockets when doing TDD and webpack refreshes the app
  for (const socket of sockets) {
    socket.mockServer?.close()
    socket.socket?.close()
  }

  sockets.length = 0;
}

function mockServer(url: string) {
  var mockServer = new Server(url);

  var pair: SocketPair = {
    mockServer
  };

  console.info('Create server with URL:', url);

  mockServer.on("connection", socket => {
    pair.socket = socket

    socket.on("message", data => {
    });
  });

  sockets.push(pair);

  return mockServer;
}

export function visitAndSpyConsole(targetSite: string, options: {
  spyLog: false
}) {
  cy.visit(targetSite, {
    onBeforeLoad (win) {
      if (options.spyLog) {
        cy.spy(win.console, 'log').as('consoleLog')
      }

      cy.spy(win.console, 'error').as('consoleError')

      const OrignalWebSocket = win.WebSocket;

      initServer();

      cy.stub(win, 'WebSocket', (url) => {
        if (url.startsWith('ws://localhost:4200/sockjs-node')) {
          return new OrignalWebSocket(url);
        }

        return mockServer(url);
      });
    },
  })
}
