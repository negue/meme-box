import type {VM} from "vm2";
import rxjs from "rxjs";
import {sleep} from "./apis/sleep.api";
import {UtilsApi} from "./apis/utils.api";
import {EnumsApi} from "./apis/enums.api";
import fetch from "node-fetch";
import {ProcessApi} from "./apis/process.api";
import lodash from "lodash";

export function setGlobalVMScope (vm: VM) {
  // Script Globals
  vm.freeze(rxjs, 'rxjs');
  vm.freeze(sleep, 'sleep');
  vm.freeze(UtilsApi, 'utils');
  vm.freeze(EnumsApi, 'enums');
  vm.freeze(fetch, 'fetch');
  vm.freeze(ProcessApi, 'process');
  vm.freeze(lodash, 'lodash');
}
