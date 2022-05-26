import {ActionType} from "@memebox/contracts";

interface MediaEditConfig {
  hasTypeSettings: boolean;
  canSelectQueue: boolean;
  showImportExportPanel?: boolean;
  hasVisibleDuration: boolean; // maybe rename "isVisibleAction"
  hasPathSelection: boolean;
  hasRequiredPlayLength?: boolean;
}

export const ACTION_CONFIG_FLAGS: Record<string, MediaEditConfig> = {
  [ActionType.Invalid]: undefined,
  [ActionType.Picture]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasVisibleDuration: true,
    hasPathSelection: true,
    hasRequiredPlayLength: true,
  },
  [ActionType.Video]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasVisibleDuration: true,
    hasPathSelection: true,
  },
  [ActionType.Audio]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasVisibleDuration: true,
    hasPathSelection: true,
  },
  [ActionType.IFrame]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasVisibleDuration: true,
    hasPathSelection: true,
    hasRequiredPlayLength: true
  },
  [ActionType.Widget]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    showImportExportPanel: true,
    hasVisibleDuration: true,
    hasPathSelection: false,
    hasRequiredPlayLength: true,
  },
  [ActionType.Script]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    showImportExportPanel: true,
    hasVisibleDuration: false,
    hasPathSelection: false,
  },
  [ActionType.PermanentScript]: {
    hasTypeSettings: true,
    canSelectQueue: false,
    showImportExportPanel: true,
    hasVisibleDuration: false,
    hasPathSelection: false,
  },
  [ActionType.WidgetTemplate]: {
    hasTypeSettings: true,
    canSelectQueue: false,
    showImportExportPanel: true,
    hasVisibleDuration: false,
    hasPathSelection: false,
  },
  [ActionType.Meta]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  hasVisibleDuration: false,
    hasPathSelection: false,
  }
} as const;

