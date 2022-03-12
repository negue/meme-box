import {Injectable} from "@angular/core";
import {Query, Store} from "@datorama/akita";
import {produce} from "immer";
import {LogicMetadataDictionary, LogicTypeMetadata} from "./generator";

@Injectable({
  providedIn: "root"
})
export class LogicContextMetadata extends Store<LogicMetadataDictionary> {

  constructor() {
    super({}, {
      producerFn: produce
    });
  }

  public registerType(...typesToRegister: LogicTypeMetadata[]): void {
    this.update(state => {
      for (const data of typesToRegister) {
        state[data.typeName] = data
      }
    });
  }
}

@Injectable({
  providedIn: "root"
})
export class LogicContextMetadataQuery extends Query<LogicMetadataDictionary> {
  constructor(protected store: LogicContextMetadata) { super(store); }
}
