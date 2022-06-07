import {ActionType} from "@memebox/contracts";

interface ActionEditConfig {
  hasTypeSettings: boolean;
  canSelectQueue: boolean;
  showImportExportPanel?: boolean;
  isVisibleAction: boolean;
  hasPathSelection: boolean;
  hasRequiredPlayLength?: boolean;
}

export const ACTION_CONFIG_FLAGS: Record<string, ActionEditConfig> = {
  [ActionType.Invalid]: undefined,
  [ActionType.Picture]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    isVisibleAction: true,
    hasPathSelection: true,
    hasRequiredPlayLength: true,
  },
  [ActionType.Video]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    isVisibleAction: true,
    hasPathSelection: true,
  },
  [ActionType.Audio]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    isVisibleAction: true,
    hasPathSelection: true,
  },
  [ActionType.IFrame]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    isVisibleAction: true,
    hasPathSelection: true,
    hasRequiredPlayLength: true
  },
  [ActionType.Widget]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    showImportExportPanel: true,
    isVisibleAction: true,
    hasPathSelection: false,
    hasRequiredPlayLength: true,
  },
  [ActionType.Script]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    showImportExportPanel: true,
    isVisibleAction: false,
    hasPathSelection: false,
  },
  [ActionType.PermanentScript]: {
    hasTypeSettings: true,
    canSelectQueue: false,
    showImportExportPanel: true,
    isVisibleAction: false,
    hasPathSelection: false,
  },
  [ActionType.WidgetTemplate]: {
    hasTypeSettings: true,
    canSelectQueue: false,
    showImportExportPanel: true,
    isVisibleAction: false,
    hasPathSelection: false,
  },
  [ActionType.Meta]: {   // TODO CHECK META
    hasTypeSettings: true,
    canSelectQueue: true,
    isVisibleAction: false,
    hasPathSelection: false,
  },
  [ActionType.Recipe]: {
    hasTypeSettings: false,  // currently using the space of the other column to fill up, todo refactor
    canSelectQueue: true,
    hasPathSelection: false,
    isVisibleAction: false,
    showImportExportPanel: true,
  }
} as const;

