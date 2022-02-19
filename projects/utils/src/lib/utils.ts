import {Dictionary, HasId} from "@memebox/contracts";

export function updateItemInDictionary<T extends HasId>(dict: Dictionary<T>, item: T) {
  dict[item.id] = item;
}

export function deleteItemInDictionary<T extends HasId>(dict: Dictionary<T>, id: string) {
  delete dict[id];
}

export function deleteInArray(arr: any[], itemToDelete: any) {
  const itemIndex = arr.indexOf(itemToDelete);
  arr.splice(itemIndex, 1);
}


export function replaceVariablesInString(source: string,
                                         knownVariables: string[],
                                         valueBag: Dictionary<any>) {
  knownVariables.forEach((key) => {
    source = source.replace(`{{${key}}}`, valueBag[key])
  });

  return source;
}
