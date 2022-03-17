import {
  LogicMetadataDictionary,
  LogicTypeMetadata,
  LogicTypeMetadataBuilder,
  variableGenerators
} from "@memebox/logic-step-core";


const actionApi = new LogicTypeMetadataBuilder('actionApi')
  .withProperties(  {
    name: 'actionId',
    typeName: 'string'
  })
  .withMethods({
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
    })
  .withContextSettings({
    name: 'actionId',
    typeName: 'memebox:actionId'
  }, {
    name: 'screenId',
    typeName: 'memebox:screenId'
  })
  .build();

variableGenerators['actionApi'] = variableGenerators['mediaApi'] = (variable, metaData) => {
  const isMedia = !!variable.payload['screenId'];

  if (isMedia) {
    return `memebox.getMedia('${variable.payload['actionId']}', '${variable.payload['screenId']}');`
  }

  return `memebox.getAction('${variable.payload['actionId']}');`
}

export const blueprintMetadata: LogicTypeMetadata[] = [
  actionApi,
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
];

export const metadataDictionary: LogicMetadataDictionary = {};

for (const data of blueprintMetadata) {
  metadataDictionary[data.typeName] = data
}
