# Store API

## API

|Method|Description|
|--------|--|
|`getString(key, defaultValue)`| This will get the string that is saved for `key`, otherwise when no value is there it'll use the `defaultValue` |
|`setString(key, newValue)`| This will set the new string that for `key` |
|`getNumber(key, defaultValue)`| This will get the number that is saved for `key`, otherwise when no value is there it'll use the `defaultValue` |
|`setNumber(key, newValue)`| This will set the new number that for `key` |
|`getObject(key, defaultValue)`| This will get the object that is saved for `key`, otherwise when no value is there it'll use the `defaultValue` |
|`setObject(key, newValue)`| This will set the new object that for `key` |


## in Widgets

Inside Widget-Scripts you can access the store by: `window.widget.store`

## in Scripts

In Scripts you can access it by `store`

