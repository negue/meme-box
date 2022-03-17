import {LogicContextMetadata} from "@memebox/logic-step-ui";
import {blueprintMetadata} from "@memebox/shared-state";

export function registerMemeboxMetadata (metadataRegister: LogicContextMetadata) {
  metadataRegister.registerType(
    ...blueprintMetadata
  );
}
