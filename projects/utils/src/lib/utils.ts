import {Dictionary, HasId} from "@memebox/contracts";

export function updateItemInDictionary<T extends HasId>(dict: Dictionary<T>, item: T): void  {
  dict[item.id] = item;
}

export function deleteItemInDictionary<T extends HasId>(dict: Dictionary<T>, id: string): void  {
  delete dict[id];
}

export function deleteInArray(arr: any[], itemToDelete: any): void  {
  const itemIndex = arr.indexOf(itemToDelete);
  arr.splice(itemIndex, 1);
}


export function replaceVariablesInString(source: string,
                                         knownVariables: string[],
                                         valueBag: Dictionary<any>): string  {
  knownVariables.forEach((key) => {
    source = source.replace(`{{${key}}}`, valueBag[key])
  });

  return source;
}


export function arraymove(
  arr: unknown[],
  fromIndex: number,
  toIndex: number
): void {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

// https://stackoverflow.com/a/424445
// https://stackoverflow.com/a/72732727

function RNG(seed: number) {
  const m = 2**35 - 31
  const a = 185852
  let s = seed % m
  return function () {
    return (s = s * a % m) / m
  }
}

Math.random = RNG(Date.now());

export function randomElement<T>(items: T[]): T {
  const chosenRandomNumber = Math.random()*items.length;
  const flooredNumber = Math.floor(chosenRandomNumber);

  const chosenItem = items[flooredNumber];

  return chosenItem;
}
