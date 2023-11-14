import {TwitchMessageTriggerConfig} from "@memebox/contracts";

export function isAllowedToTrigger(
  trigger: TwitchMessageTriggerConfig,
  foundLevels: string[]
): boolean {
  const isBroadcaster = foundLevels.includes('broadcaster');

  const allowedByRole = trigger.argumentValues.twitchRoles.some(r => foundLevels.includes(r)); // all other types don't have roles

  const allowedToTrigger = isBroadcaster || (allowedByRole);

  return allowedToTrigger;
}
