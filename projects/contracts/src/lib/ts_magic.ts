// src https://stackoverflow.com/a/57837897
// src https://stackoverflow.com/a/65503371

// Analogues to array.prototype.shift
type Shift<T extends any[]> = ((...t: T) => any) extends ((
    first: any,
    ...rest: infer Rest) => any)
  ? Rest
  : never;


type ShiftUnion<T> = T extends any[] ? Shift<T> : never;

type DeepRequired<T, P extends string[]> = T extends object
  ? (Omit<T, Extract<keyof T, P[0]>> &
    Required<
      {
        [K in Extract<keyof T, P[0]>]: NonNullable<
        DeepRequired<T[K], ShiftUnion<P>>
      >
      }
    >)
  : T;

type PathToStringArray<T extends string> = T extends `${infer Head}.${infer Tail}` ? [...PathToStringArray<Head>, ...PathToStringArray<Tail>] : [T];
export type DeepRequiredWithPathsSyntax<T, P extends string> = DeepRequired<T, PathToStringArray<P>>;
