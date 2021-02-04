import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ScreenRouteComponent} from "./screens/screen-route/screen-route.component";
import {ScreensRouteComponent} from "./screens/screens-route/screens-route.component";

// root
// | main page (with sidebar)
//   | media, obs , twitch
// | obs view page

const rootRoutes: Routes = [
  {
    path: 'manage',
    loadChildren: () => import('./manage/main-page/main-page.module').then(module => module.MainPageModule)
  },
  {
    path: 'screen/:guid',
    component: ScreenRouteComponent
  },
  {
    path: 'screens',
    component: ScreensRouteComponent
  },
  {
    path: 'test',
    loadChildren: () => import('./testpage/testpage.module').then(module => module.TestpageModule)
  },
  {
    path: 'mobile',
    loadChildren: () => import('./mobile/mobile.module').then(module => module.MobileModule)
  },
  {
    path: '**',
    redirectTo: 'manage'
  }
];


@NgModule({
  imports: [
    RouterModule.forRoot(rootRoutes, {
    enableTracing: true,
    useHash: true,
    relativeLinkResolution: 'legacy'
}),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
