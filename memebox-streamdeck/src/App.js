/* global $SD */
import React, {useEffect, useReducer, useState} from "react";

import {createUsePluginSettings, createUseSDAction, SDSelectInput, SDTextInput} from "react-streamdeck";
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

export default function App() {
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
      port: 4444,
      protocol: 'ws',
      ip: 'localhost'
    },
    connectedResult
  );

  // Holds the prev settings for useEffect
  const [prevSettings, setPrevSettings] = useState({})

  useEffect(() => {
    if (settings.port !== prevSettings.port ||
      settings.ip !== prevSettings.ip ||
      settings.protocol !== prevSettings.protocol) {
      setPrevSettings(settings);

        updateClipList([]);

        console.info('Refreshing the List', settings);

        const clipEndpoint = `${settings.protocol === 'ws' ? 'http' : 'https'}://${settings.ip}:${settings.port}/api/clips`

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
  }, [prevSettings, setPrevSettings, settings, updateClipList])



  console.log({
    connectedResult,
    settings
  });

  return (
    <div>
      <SDSelectInput
        label="Protocol"
        selectedOption={settings.protocol}
        options={protocolList}
        onChange={event => {
          const newState = {
            ...settings,
            clipId: undefined,  // reset current clip selection
            protocol: event
          };
          setSettings(newState);
        }}
      />
      <SDTextInput
        label="Host / IP"
        value={settings.ip}
        onChange={event => {
          const newState = {
            ...settings,
            clipId: undefined,  // reset current clip selection
            ip: event.target.value
          };
          console.info('HOST CHANGED', { event });
          setSettings(newState);
        }}
      />
      <SDTextInput
        label="Port"
        value={settings.port}
        onChange={event => {
          const newState = {
            ...settings,
            clipId: undefined,  // reset current clip selection
            port: event.target.value
          };
          setSettings(newState);
        }}
      />

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

    </div>
  );
}
