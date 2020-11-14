import {Subject} from "rxjs";
import {TwitchTriggerCommand} from "../projects/contracts/src/lib/types";

export const ExampleTwitchCommandsSubject = new Subject<TwitchTriggerCommand>();
