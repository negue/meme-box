import {AllLogicSteps, LogicMetadataDictionary, LogicStepCall, LogicTypeProperty, LogicVariable} from "./types";
import orderBy from "lodash/orderBy";

export const variableGenerators: {[key: string]: (variable: LogicVariable,
                                                  metaData: LogicMetadataDictionary) => string} = {};

export function generateCodeBySteps(
  steps: AllLogicSteps[],
  variables: LogicTypeProperty[],
  metaData: LogicMetadataDictionary,
  awaited = true
) {
  const result: string[] = [];

  for (const step of (steps || [])) {
    switch (step.logicStepType) {
      case 'step': {
        result.push((awaited ? 'await ' : '') + generateCallCode(step, variables, metaData).trim());
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


export function generateCallCode(step: LogicStepCall,
                                 variables: LogicTypeProperty[],
                                 metaData: LogicMetadataDictionary) {
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
      const valuePassed = step.methodArguments[m.name];

      switch (m.typeName) {
        case 'time:seconds': return valuePassed;
        case 'callback': {
          const scopeVariables = m.scopeVariables ?? [];

          const callbackVariables = scopeVariables.map(sv => sv.name).join(', ');

          return `async (${callbackVariables}) => {
              ${generateCodeBySteps(step.callbackSteps[m.name], [...variables, ...scopeVariables], metaData)}
            }`;
        }
      }

      // json data - like actionOverrides
      return JSON.stringify(valuePassed);
    })
    .join(',');

  result.push(`
      ${step.stepVariableName}.${step.methodToCall}(${orderedArguments});
    `);

  return result.join('\r\n');
}


export function generateVariables (
  variables: LogicVariable[],
  metaData: LogicMetadataDictionary,
) {
  const result: string[] = [];

  for (const variable of variables) {
    if (variable.isGlobal) {
      continue;
    }

    const generatedDeclarationOfType = variableGenerators[variable.typeName]
    ? variableGenerators[variable.typeName](variable, metaData)
      : `No Variable generators exist for ${variable.name}:${variable.typeName}`;

    result.push(`const ${variable.name} = ${generatedDeclarationOfType}`);
  }

  return result.join('\r\n');
}
