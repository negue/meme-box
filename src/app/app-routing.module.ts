import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppConfig} from "@memebox/app/env";

// root
// | main page (with sidebar)
//   | media, obs , twitch
// | obs view page

const rootRoutes: Routes = [
  {
    path: 'manage',
    loadChildren: () => import('./manage/main-page/main-page.module')
      .then(module => module.MainPageModule)
  },
  {
    path: 'screen/:guid',
    loadChildren: () => import('./screens/screen-route/screen-route.module')
      .then(module => module.ScreenRouteModule)
  },
  {
    path: 'screens',
    loadChildren: () => import('./screens/screens-route/screens-route.module')
      .then(module => module.ScreensRouteModule)
  },
  {
    path: 'test',
    loadChildren: () => import('./testpage/testpage.module')
      .then(module => module.TestpageModule)
  },
  {
    path: 'mobile',
    loadChildren: () => import('./mobile/mobile.module')
      .then(module => module.MobileModule)
  },
  {
    path: '**',
    redirectTo: 'manage'
  }
];


@NgModule({
  imports: [
    RouterModule.forRoot(rootRoutes, {
      enableTracing: !AppConfig.production,
      useHash: true,
      relativeLinkResolution: 'legacy'
    }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
