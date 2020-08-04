import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TargetScreenComponent} from "./target-screen/target-screen.component";


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
    component: TargetScreenComponent
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
      useHash: true
    }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
