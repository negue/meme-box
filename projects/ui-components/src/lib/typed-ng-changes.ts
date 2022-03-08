import {Subject} from "rxjs";

export type NgChanges<Component extends object, Props = ExcludeFunctions<Component>> = {
  [Key in keyof Props]: {
    previousValue: Props[Key];
    currentValue: Props[Key];
    firstChange: boolean;
    isFirstChange(): boolean;
  }
}

type MarkFunctionPropertyNames<Component> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [Key in keyof Component]: Component[Key] extends Function | Subject<any> ? never : Key;
}

type ExcludeFunctionPropertyNames<T extends object> = MarkFunctionPropertyNames<T>[keyof T];

type ExcludeFunctions<T extends object> = Pick<T, ExcludeFunctionPropertyNames<T>>;
