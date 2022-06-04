import { Dictionary, HasId } from "@memebox/contracts";

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
