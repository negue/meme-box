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

export default function App() {
  const getSettings = createGetSettings($SD);
  useEffect(getSettings, []);

  const connectedResult = useSDAction("connected");

  const [clipList, updateClipList] = useState([]);

  const [settings, setSettings] = createUsePluginSettings({
    useState,
    useEffect,
    useReducer
  })(
    {
      clipId: "",
      port: 4444
    },
    connectedResult
  );

  const [prevPort, setPrevPort] = useState("")

  useEffect(() => {

    if (settings.port !== prevPort) {
      setPrevPort(settings.port);

        updateClipList([]);

        console.info('Refreshing the List', settings);

        const clipEndpoint = `http://localhost:${settings.port}/api/clips`

        fetch(clipEndpoint)
          .then(response => response.json())
          .then(value => {
            console.info('ALL CLIPS', value);
            const selectionOptions = value.map(v => {
              return {
                label: v.name,
                value: v.id
              }
            });

            updateClipList(selectionOptions);
          })
          .catch(e => {
            console.info('No connection to MemeBox', e);
          })

    }
  }, [prevPort, setPrevPort, settings, updateClipList])



  console.log({
    connectedResult,
    settings
  });

  return (
    <div>
      <SDTextInput
        label="Port"
        value={settings.port}
        onChange={event => {
          const newState = {
            ...settings,
            clipId: undefined,
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
