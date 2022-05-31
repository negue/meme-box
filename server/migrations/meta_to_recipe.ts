import {
  createRecipeContext,
  generateRecipeEntryCommandCall,
  RecipeCommandConfigActionListPayload,
  RecipeCommandConfigActionPayload,
  RecipeCommandRegistry,
  RecipeRootCommandBlockId
} from "@memebox/recipe-core";
import {ActionType, MetaTriggerTypes, SettingsState} from "@memebox/contracts";

export function createTriggerActionCommand(
  actionToTriggerId: string
) {
  const recipeCommandDefinition = RecipeCommandRegistry['triggerAction'];

  const recipeEntryCommandCall = generateRecipeEntryCommandCall('triggerAction',
    {
      action: {
        actionId: actionToTriggerId
      } as RecipeCommandConfigActionPayload
    });

  if (recipeCommandDefinition.extendCommandBlock) {
    recipeCommandDefinition.extendCommandBlock(
      recipeEntryCommandCall, null
    );
  }

  return recipeEntryCommandCall;
}


export function createTriggerRandomActionCommand(
  actionIdListToTrigger: string[]
) {
  const recipeCommandDefinition = RecipeCommandRegistry['triggerRandom'];

  const recipeEntryCommandCall = generateRecipeEntryCommandCall('triggerRandom',
    {
      actions: [
        ...actionIdListToTrigger.map(id => ({
          actionId: id
        }))
      ] as RecipeCommandConfigActionListPayload
    });

  if (recipeCommandDefinition.extendCommandBlock) {
    recipeCommandDefinition.extendCommandBlock(
      recipeEntryCommandCall, null
    );
  }

  return recipeEntryCommandCall;
}

export function convertMetaActionsToRecipe (
  configFromFile: SettingsState
) {
  const actionKeyValueList = Object.entries(configFromFile.clips);

  for (const [metaId, metaAction] of actionKeyValueList) {
    if (metaAction.type !== ActionType.Meta) {
      continue;
    }

    const whatTypeOfMetaIsIt = metaAction.metaType;
    const assignedTags = metaAction.tags || [];

    // Get all clips assigned with these tags
    const allTaggedActions = actionKeyValueList.filter(
      ([actionId, foundAction]) => {
        if (metaId === actionId) {
          return false;
        }

        if (!foundAction.tags) {
          return false;
        }

        return foundAction.tags.some(tagId => assignedTags.includes(tagId))
      }
    ).map(([, foundAction]) => foundAction.id);

    const recipeContext = createRecipeContext();
    const rootEntryList = recipeContext.entries[recipeContext.rootEntry]
      .subCommandBlocks.find(b => b.labelId === RecipeRootCommandBlockId);

    switch (whatTypeOfMetaIsIt) {
      case MetaTriggerTypes.AllDelay:
      case MetaTriggerTypes.All: {
        const awaited = whatTypeOfMetaIsIt === MetaTriggerTypes.AllDelay;

        for (const actionToTrigger of allTaggedActions) {
          const createdCommand = createTriggerActionCommand(actionToTrigger);
          createdCommand.awaited = awaited;

          recipeContext.entries[createdCommand.id] = createdCommand;
          rootEntryList.entries.push(createdCommand.id);

          if (awaited) {
            const awaitedCommand = generateRecipeEntryCommandCall('sleepMs',{
              ms: metaAction.metaDelay
            });

            recipeContext.entries[awaitedCommand.id] = awaitedCommand;
            rootEntryList.entries.push(awaitedCommand.id);
          }
        }

        break;
      }
      case MetaTriggerTypes.Random: {
        const createdCommand = createTriggerRandomActionCommand(allTaggedActions);
        recipeContext.entries[createdCommand.id] = createdCommand;
        rootEntryList.entries.push(createdCommand.id);

        break;
      }
    }

    metaAction.recipe = recipeContext;
    metaAction.metaType = undefined;
    metaAction.type = ActionType.Recipe;
    metaAction.metaDelay = undefined;
  }
}
