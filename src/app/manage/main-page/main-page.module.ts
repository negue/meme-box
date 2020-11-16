import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MainPageComponent} from "./main-page.component";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {QRCodeModule} from "angular2-qrcode";
import {MatButtonModule} from "@angular/material/button";
import {NavigationModule} from "../navigation/navigation.module";


const mainRoutes: Routes = [
  {
    path: 'media',
    loadChildren: () => import('../media/media.module').then(module => module.MediaModule)
  },
  {
    path: 'screens',
    loadChildren: () => import('../screen/screens.module').then(module => module.ScreensModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('../settings/settings.module').then(module => module.SettingsModule)
  },
  {
    path: 'triggers',
    loadChildren: () => import('../triggers/triggers.module').then(module => module.TriggersModule)
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
    QRCodeModule,
    MatButtonModule,
    NavigationModule,
  ]
})
export class MainPageModule {
}
