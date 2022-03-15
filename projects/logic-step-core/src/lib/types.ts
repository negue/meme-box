import {guid} from "@datorama/akita";


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
  // todo label to show in UI (instead of TypeName)

  constructor(public typeName: string,
              public properties: LogicTypeProperty[],
              public methods: LogicTypeMethod[],
              public contextSettings: LogicTypeProperty[] = []) {
  }
}

export class LogicTypeMetadataBuilder {
  private properties: LogicTypeProperty[] = [];
  private methods: LogicTypeMethod[] = [];
  private settings: LogicTypeProperty[] = [];

  constructor(private typeName: string) {
  }

  public withProperties(...properties: LogicTypeProperty[]): LogicTypeMetadataBuilder {
    this.properties = properties;

    return this;
  }

  public withMethods(...methods: LogicTypeMethod[]): LogicTypeMetadataBuilder {
    this.methods = methods;

    return this;
  }

  public withContextSettings(...settings: LogicTypeProperty[]): LogicTypeMetadataBuilder {
    this.settings = settings;

    return this;
  }

  public build(): LogicTypeMetadata {
    return new LogicTypeMetadata(this.typeName,
      this.properties,
      this.methods,
      this.settings);
  }
}

// todo refactor maybe merge this with a logic step / method arguments

export class LogicVariable implements LogicTypeProperty {
  public id = guid();
  public isGlobal = false;

  constructor(public name: string,
              public typeName: string,
              public payload: {[key: string]: unknown} = {}) {
  }
}

export class LogicVariableGlobal extends LogicVariable {
  isGlobal = true;
}

// todo add base type

export interface LogicStep {
  id: string;
}

export interface LogicStepCall extends LogicStep {
  logicStepType: 'step';
  stepVariableName: string;
  methodToCall: string;
  methodArguments: {[key: string]: unknown};
  callbackSteps: {[key: string]: AllLogicSteps[]};
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

