import {Service} from "@tsed/di";

@Service()
export class TwitchEventsWebsocket {
  constructor(

  ) {
/*
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });*/
  }

  handleUpgrade(request: any, socket: any, head: any) {

  }
}
