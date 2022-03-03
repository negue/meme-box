import {TriggerAction} from "@memebox/contracts";
import {CURRENT_MEMEBOX_WEBSOCKET} from "./providers/websockets/memebox.websocket";
import {CURRENT_MEMEBOX_ACTION_QUEUE_EVENT_BUS} from "./providers/actions/action-queue-event.bus";

// Once all services are in the TsED way - these functions can be removed

export function triggerMediaClipById(payloadObs: TriggerAction) {
  return CURRENT_MEMEBOX_ACTION_QUEUE_EVENT_BUS.queueAction(payloadObs);
}


export function sendDataToAllSockets(message: string) {
  return CURRENT_MEMEBOX_WEBSOCKET?.sendDataToAllSockets(message);
}
