import {Injectable} from "@angular/core";
import {Query, Store, StoreConfig} from "@datorama/akita";
import {produce} from "immer";
import {LogicMetadataDictionary, LogicTypeMetadata} from "../../../logic-step-core/src/lib/generator";

@Injectable({
  providedIn: "root"
})
@StoreConfig({ name: 'logicContextMetadata', producerFn: produce })
export class LogicContextMetadata extends Store<LogicMetadataDictionary> {

  constructor() {
    super({});
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

  public getTypeMetadata$(typeName: string) {
    return this.select(store => store[typeName]);
  }
}
