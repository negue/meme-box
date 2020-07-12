import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ObsPageComponent} from "./obs-page/obs-page.component";

// root
// | main page (with sidebar)
//   | media, obs , twitch
// | obs view page

const rootRoutes: Routes = [
 {
    path: '',
    loadChildren: () => import('./main-page/main-page.module').then(module => module.MainPageModule)

  },
  {
    path: 'obs/:guid',
    component: ObsPageComponent
  },
];


@NgModule({
  imports: [
    RouterModule.forRoot(rootRoutes, {
      enableTracing: true,
      useHash: true
    }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
