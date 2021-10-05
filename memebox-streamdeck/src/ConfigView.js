/* global $SD */
import React, {useEffect, useReducer, useState} from "react";

import {
  createUseGlobalSettings,
  createUsePluginSettings,
  createUseSDAction,
  SDCheckbox,
  SDSelectInput,
  SDTextInput
} from "react-streamdeck";
// Slightly modified sdpi.css file. Adds 'data-' prefixes where needed.
import "react-streamdeck/dist/css/sdpi.css";

const createGetSettings = _sd => () => {
  if (_sd.api.getSettings) {
    _sd.api.getSettings(_sd.uuid);
  } else {
    _sd.api.common.getSettings(_sd.uuid);
  }
};

const useSDAction = createUseSDAction({
  useState,
  useEffect
});

function typeNumToString(typeNum){
  switch(typeNum) {
    case 0: return 'Picture';
    case 1: return 'Audio';
    case 2: return 'Video';
    case 3: return 'IFrame';
    case 100: return 'Meta';

    default: return `Unknown: ${typeNum}`;
  }
}

export default function ConfigView() {
  const getSettings = createGetSettings($SD);
  useEffect(getSettings, []);

  const connectedResult = useSDAction("connected");

  const protocolList = [
    {
      label: 'ws://',
      value: 'ws'
    },
    {
      label: 'wss://',
      value: 'wss'
    }
  ]

  const [clipList, updateClipList] = useState([]);

  const [settings, setSettings] = createUsePluginSettings({
    useState,
    useEffect,
    useReducer
  })(
    {
      clipId: "",
      targetServer: ""
    },
    connectedResult
  );

  const [globalSettings, setGlobalSettings] = createUseGlobalSettings({
    useState,
    useEffect,
    useReducer
  })(
    {
      advanced: false,
      port: 6363,
      protocol: 'ws',
      ip: 'localhost'
    },
    connectedResult
  );

  // Holds the prev settings for useEffect
  const [prevGlobalSettings, setPrevGlobalSettings] = useState({})

  useEffect(() => {
    if (globalSettings.port !== prevGlobalSettings.port ||
      globalSettings.ip !== prevGlobalSettings.ip ||
      globalSettings.protocol !== prevGlobalSettings.protocol) {
      setPrevGlobalSettings(globalSettings);

        updateClipList([]);

        console.info('Refreshing the List', globalSettings);

        const protocol = globalSettings.protocol === 'ws' ? 'http' : 'https';
        const clipEndpoint = `${protocol}://${globalSettings.ip}:${globalSettings.port}/api/clips`

      console.info({
        clipEndpoint
      });

        fetch(clipEndpoint)
          .then(response => response.json())
          .then(value => {
            console.info('ALL CLIPS', value);
            const selectionOptions = value.map(v => {
              return {
                label: `${typeNumToString(v.type)}: ${v.name}`,
                value: v.id
              }
            });

            updateClipList(selectionOptions);
          })
          .catch(e => {
            console.info('No connection to MemeBox', e);
          })

    }
  }, [prevGlobalSettings, setPrevGlobalSettings, globalSettings, updateClipList])


  useEffect(() => {
    const newUrl = `${globalSettings.protocol}://${globalSettings.host}:${globalSettings.portNumber}`;

    if (settings.targetServer !== newUrl) {
      const newState = {
        ...settings,
        targetServer: newUrl
      };
      setSettings(newState);
    }
  }, [globalSettings, settings, setSettings])

  function resetClipId() {
    const newState = {
      ...settings,
      clipId: undefined,  // reset current clip selection
    };
    setSettings(newState);
  }

  console.log({
    connectedResult,
    settings,
    globalSettings
  });

  return (
    <div>
      <SDSelectInput
        label="Clip"
        selectedOption={settings.clipId}
        options={clipList}
        onChange={event => {
          const newState = {
            ...settings,
            clipId: event
          };
          setSettings(newState);
        }}
      />

      <SDCheckbox
        label="Advanced"
        checkboxLabel="Enable Advanced Connection"
        value={globalSettings.advanced}
        onChange={(event, value) => {
          resetClipId();

          const newState = {
            ...globalSettings,
            advanced: value
          };
          setGlobalSettings(newState);
        }}
      />

      {globalSettings.advanced &&
        <SDSelectInput
          label="Protocol"
          selectedOption={globalSettings.protocol}
          options={protocolList}
          onChange={event => {
            resetClipId();

            const newState = {
              ...globalSettings,
              protocol: event
            };
            setGlobalSettings(newState);
            console.info('new protocol', globalSettings);
          }}
        />}
      {globalSettings.advanced &&
        <SDTextInput
          label="Host / IP"
          value={globalSettings.ip}
          onChange={event => {
            resetClipId();

            const newState = {
              ...globalSettings,
              ip: event.target.value
            };
            console.info('HOST CHANGED', {event});
            setGlobalSettings(newState);
          }}
        />}
      {globalSettings.advanced &&
        <SDTextInput
          label="Port"
          value={globalSettings.port}
          onChange={event => {
            resetClipId();

            const newState = {
              ...globalSettings,
              port: event.target.value
            };
            setGlobalSettings(newState);
          }}
        />
      }
    </div>
  );
}
