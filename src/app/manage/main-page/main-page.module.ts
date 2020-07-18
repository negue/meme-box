import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MainPageComponent} from "./main-page.component";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";


const mainRoutes: Routes = [
  {
    path: 'media',
    loadChildren: () => import('../media/media.module').then(module => module.MediaModule)
  },
  {
    path: 'screen',
    loadChildren: () => import('../screen/screen.module').then(module => module.ScreenModule)
  },
  {
    path: 'twitch',
    loadChildren: () => import('../twitch/twitch.module').then(module => module.TwitchModule)
  },
  {
    path: '',
    redirectTo: 'media',
    pathMatch: 'full'
  }
];


const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
    children: mainRoutes,
  },
];


@NgModule({
  declarations: [MainPageComponent],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    RouterModule.forChild(routes),
  ]
})
export class MainPageModule { }
