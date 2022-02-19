import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MainPageComponent} from "./main-page.component";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {QRCodeModule} from "angular2-qrcode";
import {MatButtonModule} from "@angular/material/button";
import {NavigationModule} from "../navigation/navigation.module";
import {DialogsModule} from "../../shared/dialogs/dialogs.module";
import {MatIconModule} from "@angular/material/icon";
import {NotesComponent} from './notes/notes.component';
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {WidgetStoreRemoteAdapter} from "../../shared/components/dynamic-iframe/widget-store-remote-adapter.service";

// TODO cleanup / move to /pages folder

const mainRoutes: Routes = [
  {
    path: 'actions',
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
    path: 'dashboard',
    loadChildren: () => import('../../pages/dashboard/dashboard.module')
      .then(module => module.DashboardModule)
  },
  {
    path: '',
    redirectTo: 'actions',
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
  declarations: [MainPageComponent, NotesComponent],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    RouterModule.forChild(routes),
    QRCodeModule,
    MatButtonModule,
    NavigationModule,
    DialogsModule,
    MatIconModule,
    MatBottomSheetModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  providers: [
    WidgetStoreRemoteAdapter
  ]
})
export class MainPageModule {
}
