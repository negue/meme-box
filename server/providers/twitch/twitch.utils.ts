import {TwitchEventTypes, TwitchTriggerCommand} from "@memebox/contracts";

export function isAllowedToTrigger(
  trigger: TwitchTriggerCommand,
  foundLevels: string[]
): boolean {
  const isBroadcaster = foundLevels.includes('broadcaster');

  const allowedByRole = trigger.command?.roles.some(r => foundLevels.includes(r))
    || trigger.command.event !== TwitchEventTypes.message; // all other types don't have roles


  const allowedToTrigger = isBroadcaster || (allowedByRole);

  return allowedToTrigger;
}
