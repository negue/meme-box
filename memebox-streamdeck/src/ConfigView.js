/* global $SD */
import React, {useEffect, useReducer, useState} from "react";

import {SDCheckbox, SDSelectInput, SDTextInput} from "react-streamdeck";
// Slightly modified sdpi.css file. Adds 'data-' prefixes where needed.
import "react-streamdeck/dist/css/sdpi.css";
import {createUseSDAction, myButtonSettings, myGlobalSettings} from "./myGlobalSettings";

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

  const [settings, setSettings] = myButtonSettings({
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

  const [globalSettings, setGlobalSettings] = myGlobalSettings({
    useState,
    useEffect,
    useReducer
  })(
    {
      advanced: false,
      port: 6363,
      protocol: 'ws',
      host: 'localhost'
    },
    connectedResult
  );

  // Holds the prev settings for useEffect
  const [prevGlobalSettings, setPrevGlobalSettings] = useState({})

  useEffect(() => {
    if (globalSettings.port !== prevGlobalSettings.port ||
      globalSettings.host !== prevGlobalSettings.host ||
      globalSettings.protocol !== prevGlobalSettings.protocol) {
      setPrevGlobalSettings(globalSettings);

        updateClipList([]);

        const protocol = globalSettings.protocol === 'ws' ? 'http' : 'https';
        const clipEndpoint = `${protocol}://${globalSettings.host}:${globalSettings.port}/api/action/simpleList`

        fetch(clipEndpoint)
          .then(response => response.json())
          .then(value => {
            console.info('ALL CLIPS', value);
            const selectionOptions = value.map(v => {
              return {
                label: `${v.typeString}: ${v.name}`,
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
    const newUrl = `${globalSettings.protocol}://${globalSettings.host}:${globalSettings.port}/`;

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

  return (
    <div>
      <SDSelectInput
        label="Action"
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
          value={globalSettings.host}
          onChange={event => {
            resetClipId();

            const newState = {
              ...globalSettings,
              host: event.target.value
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
