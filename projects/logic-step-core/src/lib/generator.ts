import orderBy from "lodash/orderBy";


export interface LogicTypeProperty {
  name: string;
  typeName: string;
}

export interface LogicTypeMethodArgument extends LogicTypeProperty {
  index: number;
  isStepGroup?: boolean;
  scopeVariables?: LogicTypeProperty[]
}

export interface LogicTypeMethod {
  name: string;
  arguments: LogicTypeMethodArgument[];
}

export class LogicTypeMetadata {
  constructor(public typeName: string,
              public properties: LogicTypeProperty[],
              public methods: LogicTypeMethod[]) {
  }
}

export class LogicVariable {
  public isGlobal = false;

  constructor(public name: string,
              public typeName: string) {
  }
}

// todo add base type

export interface LogicStep {
  id: string;
}

export interface LogicStepCall extends LogicStep {
  logicStepType: 'call';
  stepVariableName: string;
  methodToCall: string;
  arguments: {[key: string]: unknown}| unknown[]
}

export interface LogicStepGroup  extends LogicStep {
  logicStepType: 'group';
  awaited: boolean;

  steps: AllLogicSteps[];
}

export type AllLogicSteps = LogicStepCall | LogicStepGroup;

/**
 * await myActionVar.triggerWhile(async (helpers) => { } )
 *
 * // a new scope variable would be added
 * // this would need to be able to write steps internally
 */


export type LogicMetadataDictionary = {[key: string]: LogicTypeMetadata};

export function generateCodeBySteps(
  steps: AllLogicSteps[],
  variables: LogicTypeProperty[],
  metaData: LogicMetadataDictionary,
  awaited = true
) {
  const result: string[] = [];

  for (const step of steps) {
    switch (step.logicStepType) {
      case 'call': {
        result.push( (awaited ? 'await ' : '') + generateCallCode(step, variables, metaData).trim());
        break;
      }

      case 'group': {
        if (step.awaited) {
          result.push('(async () => {');
        }

        result.push(
          `
            ${generateCodeBySteps(step.steps, variables, metaData, step.awaited)}
          `
        );

        if (step.awaited) {
          result.push('})');
        }


        break;
      }
    }
  }

  return result.join('\r\n');
}


export function generateCallCode(step: LogicStepCall, variables: LogicTypeProperty[], metaData: LogicMetadataDictionary) {
  const result: string[] = [];

  // todo check possible methods of variable / metadata
  const variableInfo = variables.find(v => v.name === step.stepVariableName);

  if (!variableInfo) {
    return `Unknown: Variable ${step.stepVariableName}`;
  }

  const metaDataOfType = metaData[variableInfo.typeName];
  const methodMetadata = metaDataOfType.methods.find(m => m.name === step.methodToCall);

  if (!methodMetadata) {
    return `Unknown: Method ${step.methodToCall}`;
  }

  const orderedArguments = orderBy(methodMetadata.arguments, ['index'])
    .map(m => {
      const valuePassed = typeof step.arguments === 'object'
        ? step.arguments[m.name]
        : null;

      switch (m.typeName) {
        case 'time:seconds': return valuePassed;
        case 'callback': {
          const scopeVariables = m.scopeVariables ?? [];

          const callbackVariables = scopeVariables.map(sv => sv.name).join(', ');

          return `async (${callbackVariables}) => {
              ${generateCodeBySteps(step.arguments as AllLogicSteps[], [...variables, ...scopeVariables], metaData)}
            }`;
        }
      }

      return JSON.stringify(valuePassed);
    })
    .join(',');

  result.push(`
      ${step.stepVariableName}.${step.methodToCall}(${orderedArguments});
    `);

  return result.join('\r\n');
}
