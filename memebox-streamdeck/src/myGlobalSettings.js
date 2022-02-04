/* global $SD */
const SETTINGS_PROPS = {
  buttonSettings: {
    SDEVENT: 'didReceiveSettings',
    get: 'getSettings',
    set: 'setSettings',
  },
  globalSettings: {
    SDEVENT: 'didReceiveGlobalSettings',
    get: 'getGlobalSettings',
    set: 'setGlobalSettings'
  }
}

function callGetSettings(_sd, type) {
  const methodToCall = SETTINGS_PROPS[type].get;

  if (_sd.api[methodToCall]) {
    _sd.api[methodToCall](_sd.uuid);
  } else {
    _sd.api.common[methodToCall](_sd.uuid);
  }
}


export function createUseSDAction({ useState, useEffect }) {
  return function(actionName) {
    const [state, setState] = useState({});

    // if (process.env.NODE_ENV === "development") {
    //   // dev specific checks and helpers
    // }

    useEffect(() => {
      const handler = (jsn) => {
        console.info('SD action callback', actionName, jsn);

        if (jsn.actionInfo && jsn.actionInfo.payload && jsn.actionInfo.payload.settings) {
          setState(jsn);
        } else if (jsn.payload && jsn.payload.settings) {
          setState(jsn.payload.settings);
        } else if (jsn.payload) {
          setState(jsn.payload);
        }
      };

      console.info('register for SD action callback', actionName, $SD.uuid);

      $SD.on(`${actionName}`, handler);

      return () => {
        $SD.off(`${actionName}`, handler);
      };
    }, [actionName]);
    return state;
  };
}

const waitTime = 350;

function timeoutAsync(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function anyOfThoseApisExist () {
  // compiler says no to return !!$SD.api?.getGlobalSettings || !!$SD.api?.common?.getGlobalSettings;
  return $SD
    && (
      ($SD.api && $SD.api.getGlobalSettings)
    || ($SD.api && $SD.api.common && $SD.api.common.getGlobalSettings)
  ) && $SD.uuid;
}

const areTheSettingsThereYetAsync = new Promise(async (resolve, reject) => {
  let retryCount = 0;

  console.info('beginning to try if the data is available');

  while (!anyOfThoseApisExist()) {
    if (retryCount > 10) {
      reject();

      break;
    }

    retryCount++;
    console.info('still no $SD properties there yet');
    await timeoutAsync(waitTime);
  }

  resolve(true);
});



function createUseBaseSettings(
  useReducer,
  useEffect,
  type
) {
  return function(initialState, connectedResult, settings) {
    console.info("Reducer State ", type, initialState, settings);

    useEffect(() => {
      areTheSettingsThereYetAsync.then(() => {
        console.info('calling getSettings', type, $SD.uuid);

//         safeGetSettings(type, $SD.uuid);
        callGetSettings($SD, type);
      });
    }, [connectedResult]);


    const reducerResult = useReducer(
      (currentState, newState) => {
        return { ...currentState, ...newState };
      },
      initialState,
      (initialState) => {
        return { ...initialState };
      }
    );


    const [state, setState] = reducerResult;


    useEffect(() => {

      console.info('settings changed', type, settings);

      setState(settings);
    }, [setState, settings]);

    useEffect(() => {
      console.info('Normal Settings setState',{
        type,
        connectedResult
      });


      if (
        connectedResult &&
        connectedResult.actionInfo &&
        type === 'buttonSettings'
      ) {

        setState(connectedResult.actionInfo.payload.settings);
      }
    }, [setState, connectedResult]);


    return reducerResult;
  };
}

function safeSetSettings(type, ...args) {
  const methodToCall = SETTINGS_PROPS[type].set;

  console.info('calling', type, methodToCall, ...args);

  if ($SD.api[methodToCall]) {
    return $SD.api[methodToCall](...args);
  } else if ($SD.api.common[methodToCall]) {
    return $SD.api.common[methodToCall](...args);
  } else {
    return $SD[methodToCall](...args);
  }
}

function createUseSettings(type) {
  return function ({
                     useReducer,
                     useEffect,
                     useState
                   }) {
    const useSettings = createUseBaseSettings(
      useReducer,
      useEffect,
      type
    );
    const useSDAction = createUseSDAction({
      useState,
      useEffect,
    });

    return function (initialSettings, connectedResult) {

      const settingsResult = useSDAction(SETTINGS_PROPS[type].SDEVENT);

      const [settings, setSettings] = useSettings(
        initialSettings,
        connectedResult,
        settingsResult
      );

      return [
        settings,
        (newSettings) => {
          console.info('GOT NEW SETTINGS TO SAVE', type, newSettings);



          console.info('SETTING TO SDAPI', type, $SD.uuid);

          setTimeout(() => {


          }, 100);

          safeSetSettings(type, $SD.uuid, newSettings);
         //  safeGetSettings(type, $SD.uuid);
          setSettings(newSettings);

        },
      ];
    };
  };
}

export const myGlobalSettings = createUseSettings('globalSettings');
export const myButtonSettings = createUseSettings('buttonSettings');
