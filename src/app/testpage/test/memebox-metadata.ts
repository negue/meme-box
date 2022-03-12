import {LogicContextMetadata, LogicTypeMetadata} from "@memebox/logic-step-core";

export function registerMemeboxMetadata (metadataRegister: LogicContextMetadata) {
  metadataRegister.registerType(
    new LogicTypeMetadata('actionApi',
      [
        {
          name: 'actionId',
          typeName: 'string'
        }
      ], [
        {
          name: 'trigger',
          arguments: [
            {
              name: 'overrides',
              typeName: 'TriggerActionOverrides',
              index: 0
            }
          ]
        },
        {
          name: 'updateVariables',
          arguments: [
            {
              name: 'overrides',
              typeName: 'ActionOverridableProperties',
              index: 0
            },
            {
              name: 'timeoutInMs',
              typeName: 'time:ms',
              index: 1
            }
          ]
        }
      ]
    ),
    new LogicTypeMetadata('mediaCallbackHelper', [

    ], [
      {
        name:'reset',
        arguments: []
      },
      {
        name:'resetAfterDone',
        arguments: [{
          name: 'delayAfterTriggered',
          index: 0,
          typeName: 'time:ms'
        }]
      },
    ]),
    new LogicTypeMetadata('mediaApi',
      [
        {
          name: 'actionId',
          typeName: 'string'
        }
      ], [
        {
          name: 'trigger',
          arguments: [
            {
              name: 'overrides',
              typeName: 'TriggerActionOverrides',
              index: 0
            }
          ]
        },
        {
          name: 'triggerWhile',
          arguments: [
            {
              name: 'callback',
              typeName: 'callback',
              index: 0,
              isStepGroup: true,
              scopeVariables: [
                {
                  name: 'helper',
                  typeName: 'mediaCallbackHelper'
                }
              ]
            }
          ]
        },
        {
          name: 'updateVariables',
          arguments: [
            {
              name: 'overrides',
              typeName: 'ActionOverridableProperties',
              index: 0
            },
            {
              name: 'timeoutInMs',
              typeName: 'time:ms',
              index: 1
            }
          ]
        }
      ]
    ),
    new LogicTypeMetadata('sleepApi',
      [
      ], [
        {
          name: 'secondsAsync',
          arguments: [
            {
              name: 'sleepInSeconds',
              typeName: 'time:seconds',
              index: 0
            }
          ]
        }
      ]
    )
  );
}
