/* global $SD */
import React, {useEffect, useReducer, useState} from "react";

import {createUsePluginSettings, createUseSDAction, SDSelectInput,} from "react-streamdeck";
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

// TODO use the constants
const clipEndpoint = "http://localhost:4445/api/clips"


export default function App() {
  const getSettings = createGetSettings($SD);
  useEffect(getSettings, []);

  const connectedResult = useSDAction("connected");

  const [clipList, updateClipList] = useState([]);

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

  const [settings, setSettings] = createUsePluginSettings({
    useState,
    useEffect,
    useReducer
  })(
    {
      clipId: ""
    },
    connectedResult
  );


  console.log({
    connectedResult,
    settings
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

    </div>
  );
}
