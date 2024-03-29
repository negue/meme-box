| Method | Endpoint                                       | Class method                                              |
|--------|------------------------------------------------|-----------------------------------------------------------|
| GET    | /api/action/simpleList                         | ActionController.getList()                                |
| GET    | /api/action/last_actions                       | ActionController.getLast20Events()                        |
| GET    | /api/action/lastOverrides/:actionId            | ActionController.getLastActionOverrides()                 |
| POST   | /api/action/trigger/:actionId                  | ActionController.triggerAction()                          |
| GET    | /api/actionActivity/current                    | ActionActivityController.getCurrentState()                |
| GET    | /api/config/                                   | ConfigController.getConfig()                              |
| PUT    | /api/config/twitch                             | ConfigController.updateTwitchConfig()                     |
| PUT    | /api/config/obs                                | ConfigController.updateObsConfig()                        |
| PUT    | /api/config/                                   | ConfigController.updateConfig()                           |
| PUT    | /api/config/customPort                         | ConfigController.updatePort()                             |
| DELETE | /api/config/twitchRevoke/:authType             | ConfigController.revokeToken()                            |
| GET    | /api/file/                                     | FileController.getList()                                  |
| GET    | /api/file/fileById/:mediaId                    | FileController.getById()                                  |
| GET    | /api/file/preview/:mediaId                     | FileController.getPreviewById()                           |
| GET    | /api/screen/                                   | ScreenController.listAllScreens()                         |
| POST   | /api/screen/                                   | ScreenController.addScreen()                              |
| PUT    | /api/screen/:screenId                          | ScreenController.updateScreen()                           |
| DELETE | /api/screen/:screenId                          | ScreenController.deleteScreen()                           |
| PUT    | /api/screen/:screenId/clips/bulk               | ScreenController.updateScreenMediaBulk()                  |
| PUT    | /api/screen/:screenId/clips/:mediaId           | ScreenController.updateScreenMedia()                      |
| DELETE | /api/screen/:screenId/clips/:mediaId           | ScreenController.deleteScreenMedia()                      |
| GET    | /api/widget-state/:mediaId                     | WidgetStateController.getWidgetState()                    |
| PUT    | /api/widget-state/:mediaId/:widgetInstance     | WidgetStateController.updateScreen()                      |
| GET    | /api/open/config                               | OpenController.openConfigPath()                           |
| GET    | /api/open/files                                | OpenController.openFilePath()                             |
| GET    | /api/twitchData/helix/*                        | TwitchDataController.getHelixData()                       |
| GET    | /api/twitchData/authInformations               | TwitchDataController.getTwitchAuthInformations()          |
| GET    | /api/twitchData/currentChannelPointRedemptions | TwitchDataController.listCurrentChannelPointRedemptions() |
| GET    | /api/twitch_events/                            | TwitchEventsController.getTwitchEvents()                  |
| POST   | /api/twitch_events/                            | TwitchEventsController.addTwitchEvent()                   |
| PUT    | /api/twitch_events/:eventId                    | TwitchEventsController.updateTwitchEvent()                |
| DELETE | /api/twitch_events/:eventId                    | TwitchEventsController.deleteTwitchEvent()                |
| POST   | /api/twitch_events/trigger_config_example      | TwitchEventsController.triggerConfigExample()             |
| POST   | /api/twitch_events/trigger_event               | TwitchEventsController.triggerEvent()                     |
| GET    | /api/twitch_events/last_events                 | TwitchEventsController.getLast20Events()                  |
| GET    | /api/obsData/currentBrowserSources             | ObsDataController.listBrowserSources()                    |
| POST   | /api/obsData/refreshBrowserSource/:sourceName  | ObsDataController.refreshBrowserSource()                  |
| GET    | /api/obsData/sceneList                         | ObsDataController.getSceneList()                          |
| GET    | /api/obsData/sourceList                        | ObsDataController.getSourceList()                         |
| GET    | /api/obsData/sourceFilters/:sourceName         | ObsDataController.getSourceFilterList()                   |
