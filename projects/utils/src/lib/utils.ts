import {Dictionary, HasId} from "../../../contracts/src/lib/types";

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
